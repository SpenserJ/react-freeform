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
      injector: PropTypes.func.isRequired,
      formSubscription: PropTypes.objectOf(PropTypes.func).isRequired,
    };

    constructor(props, context) {
      super(props, context);
      this.state = {
        ...(this.state || {}),
        values: this.getDefaults(),
      };

      this._injector = {
        getValue: this.getValue,
        onChange: this.onChange,
      };

      this.subscriptions = [];
    }

    getChildContext() {
      const superChildContext = (typeof super.getChildContext === 'function')
        ? super.getChildContext()
        : {};
      return {
        ...superChildContext,
        injector: this.injector,
        formSubscription: {
          subscribe: (callback, path) => {
            this.subscriptions.push(callback);
          },
          unsubscribe: (callback, path) => {
            this.subscriptions = this.subscriptions.filter(v => v !== callback);
          },
        },
      }
    }

    injector = () => {
      return this._injector;
    }

    getDefaults() {
      if (typeof super.getDefaults !== 'function') { return {}; }
      return super.getDefaults();
    }

    getValue = () => {
      return this.state.values;
    }

    onChange = (e) => {
      this.setState({
        values: immutableObject.set(this.state.values, e.target.name, e.target.value),
      }, () => {
        this.subscriptions.forEach(callback => callback());
      })
    }

    render() {
      const content = super.render ? super.render() : this.props.children;
      return (
        <form>
          {content}
        </form>
      );
    }
  };
};
