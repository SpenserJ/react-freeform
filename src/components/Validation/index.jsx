import React from 'react';
import PropTypes from 'prop-types';

import ValueSubscriber from '../ValueSubscriber/';

export const runValidationRules = (rules, value, invalidate) => {
  if (typeof rules === 'object') {
    if (Array.isArray(rules)) {
      rules.forEach(rule => runValidationRules(rule, value, invalidate));
    } else {
      Object.keys(rules).forEach((key) => {
        runValidationRules(
          rules[key],
          value[key],
          (error, nestedName = []) => invalidate(error, [key].concat(nestedName)),
        );
      });
    }
  } else {
    rules(value, invalidate);
  }
};

export default class Validation extends ValueSubscriber {
  static propTypes = {
    ...ValueSubscriber.propTypes,
    /**
     * Validation rules can be specified as a single function, an array of functions,
     * an object of functions, or an object of arrays of functions. Functions will
     * receive the form values at this level, and objects will return the matching
     * value for its key.
     * @param {any} value The value to be validated
     * @param {function} invalidate A function that may be called with an error string
     */
    rules: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.arrayOf(PropTypes.func),
      PropTypes.objectOf([
        PropTypes.func,
        PropTypes.arrayOf(PropTypes.func),
      ]),
    ]).isRequired,
    /**
     * Should error messages be displayed before or after the children
     */
    displayBeforeChildren: PropTypes.bool,
  };

  static defaultProps = {
    ...ValueSubscriber.defaultProps,
    displayBeforeChildren: false,
  }

  static contextTypes = {
    ...ValueSubscriber.contextTypes,
    ffUpdateValidation: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      ...this.state,
      validationResult: [],
    };
    // setState may fire asynchronously, so we need to track the state with a property for rapid updates.
    this.dirtyValidationResult = [];
  }

  triggerUpdate() {
    super.triggerUpdate();
    this.runValidation();
  }

  componentDidMount() {
    super.componentDidMount();
    this.runValidation();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.context.ffUpdateValidation(this.state.validationResult, []);
  }

  // TODO: If the rules prop changes, revalidate

  runValidation() {
    const value = this.getValue();
    const result = [];
    const invalidate = (error, nestedName = []) => {
      result.push([nestedName, error]);
    };
    runValidationRules(this.props.rules, value, invalidate);

    // Check validation results for differences
    if (this.dirtyValidationResult.length === result.length) {
      let validationChanged = false;
      let i = 0;
      while (validationChanged === false && i < result.length) {
        const newVal = result[i];
        const oldVal = this.dirtyValidationResult[i];
        if (newVal[0].join('|') !== oldVal[0].join('|') || newVal[1] !== oldVal[1]) {
          validationChanged = true;
        }
        i += 1;
      }

      if (validationChanged === false) { return; }
    }

    const oldResult = this.dirtyValidationResult;
    // Track the new validation outside of the state, to prevent async race conditions
    this.dirtyValidationResult = result;
    this.setState({ validationResult: result });
    this.context.ffUpdateValidation(oldResult, result);
  }

  /**
   * Override this to change how the validation errors are rendered
   * @public
   */
  renderErrors() {
    if (this.state.validationResult.length === 0) { return null; }
    return (
      <ul>
        {/* eslint-disable-next-line react/no-array-index-key */}
        {this.state.validationResult.map((v, i) => <li key={i}>{v[1]}</li>)}
      </ul>
    );
  }

  render() {
    const { displayBeforeChildren } = this.props;
    const children = super.render();
    return (
      <React.Fragment>
        {displayBeforeChildren ? null : children}
        {this.renderErrors()}
        {displayBeforeChildren ? children : null}
      </React.Fragment>
    );
  }
}
