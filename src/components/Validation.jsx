import React from 'react';
import PropTypes from 'prop-types';

import ValueSubscriber from './ValueSubscriber';

const runValidationRules = (rules, value, invalidate) => {
  if (typeof rules === 'object') {
    if (Array.isArray(rules)) {
      rules.forEach(rule => runValidationRules(rule, value, invalidate));
    } else {
      Object.entries(rules).forEach(([key, rule]) => {
        runValidationRules(
          rule,
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
    rules: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.arrayOf(PropTypes.func),
      PropTypes.objectOf([
        PropTypes.func,
        PropTypes.arrayOf(PropTypes.func),
      ]),
    ]).isRequired,
  };

  static contextTypes = {
    ...ValueSubscriber.contextTypes,
    nfUpdateValidation: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.oldValidation = [];
  }

  triggerUpdate() {
    super.triggerUpdate();
    this.runValidation();
  }

  componentDidMount() {
    super.componentDidMount();
    this.runValidation();
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
    if (this.oldValidation.length === result.length) {
      let validationChanged = false;
      let i = 0;
      while (validationChanged === false && i < result.length) {
        const newVal = result[i];
        const oldVal = this.oldValidation[i];
        if (newVal[0].join('|') !== oldVal[0].join('|') || newVal[1] !== oldVal[1]) {
          validationChanged = true;
        }
        i += 1;
      }

      if (validationChanged === false) { return; }
    }

    this.context.nfUpdateValidation(this.oldValidation, result);
    this.oldValidation = result;
  }
}
