import React from 'react';
import PropTypes from 'prop-types';
import immutableObject from 'object-path-immutable';
import invariant from 'invariant';

import { getDisplayName } from '../../utilities';

let formIndex = 0;

export default (WrappedComponent) => {
  invariant(WrappedComponent.prototype.isReactComponent, 'Cannot extend a functional component');

  return class extends WrappedComponent {
    static displayName = `handler(${getDisplayName(WrappedComponent)})`;

    static childContextTypes = {
      ...(WrappedComponent.childContextTypes || {}),
      ffGetValue: PropTypes.func.isRequired,
      ffOnChange: PropTypes.func.isRequired,
      ffFullName: PropTypes.func.isRequired,
      ffFormIndex: PropTypes.number.isRequired,
      formSubscription: PropTypes.objectOf(PropTypes.func).isRequired,
    };

    constructor(props, context) {
      super(props, context);
      this.formIndex = formIndex;
      formIndex += 1;
      this.state = {
        ...(this.state || {}),
        values: this.getDefaults(),
      };

      this.subscriptions = [];
    }

    getChildContext() {
      const superChildContext = (typeof super.getChildContext === 'function')
        ? super.getChildContext()
        : {};
      return {
        ...superChildContext,
        ffGetValue: this.getValue,
        ffOnChange: this.onChange,
        ffFullName: () => ([]),
        ffFormIndex: this.formIndex,
        formSubscription: {
          subscribe: callback => this.subscriptions.push(callback),
          unsubscribe: (callback) => {
            this.subscriptions = this.subscriptions.filter(v => v !== callback);
          },
        },
      };
    }

    getDefaults() {
      if (typeof super.getDefaults !== 'function') { return {}; }
      return super.getDefaults();
    }

    getValue = () => this.state.values;

    onChange = e => this.setState(
      ({ values }) => ({ values: immutableObject.set(values, e.target.name, e.target.value) }),
      () => this.triggerUpdate(),
    );

    triggerUpdate() {
      this.subscriptions.forEach(callback => callback());
    }

    // eslint-disable-next-line class-methods-use-this
    formProps() { return super.formProps ? super.formProps() : {}; }

    render() {
      const content = super.render ? super.render() : this.props.children;
      return (
        <form {...this.formProps()}>
          {content}
        </form>
      );
    }
  };
};
