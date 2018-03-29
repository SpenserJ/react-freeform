import React from 'react';
import PropTypes from 'prop-types';
import immutableObject from 'object-path-immutable';

import { getDisplayName } from '../utilities';

export default (WrappedComponent) => {
  if (!WrappedComponent.prototype.isReactComponent) {
    throw 'Cannot extend a pure component';
  }

  return class extends WrappedComponent {
    static displayName = `handler(${getDisplayName(WrappedComponent)})`;

    static childContextTypes = {
      nfGetValue: PropTypes.func.isRequired,
      nfOnChange: PropTypes.func.isRequired,
      nfFullName: PropTypes.func.isRequired,
      formSubscription: PropTypes.objectOf(PropTypes.func).isRequired,
    };

    constructor(props, context) {
      super(props, context);
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
        nfGetValue: this.getValue,
        nfOnChange: this.onChange,
        nfFullName: () => ([]),
        formSubscription: {
          subscribe: callback => this.subscriptions.push(callback),
          unsubscribe: (callback) => {
            this.subscriptions = this.subscriptions.filter(v => v !== callback);
          },
        },
      }
    }

    getDefaults() {
      if (typeof super.getDefaults !== 'function') { return {}; }
      return super.getDefaults();
    }

    getValue = () => this.state.values;

    onChange = (e) => {
      this.setState({
        values: immutableObject.set(this.state.values, e.target.name, e.target.value),
      }, () => {
        this.subscriptions.forEach(callback => callback());
      })
    }

    formProps() {
      return {};
    }

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
