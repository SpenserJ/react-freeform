import React from 'react';
import PropTypes from 'prop-types';
import immutableObject from 'object-path-immutable';

export default (WrappedComponent) => {
  if (!WrappedComponent.prototype.isReactComponent) {
    throw 'Cannot extend a pure component';
  }

  return class Test extends WrappedComponent {
    static childContextTypes = {
      injector: PropTypes.func.isRequired,
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
    }

    getChildContext() {
      const superChildContext = (typeof super.getChildContext === 'function')
        ? super.getChildContext()
        : {};
      return {
        ...superChildContext,
        injector: this.injector,
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
      console.log(e.target.name, e.target.value);
      this.setState({
        values: immutableObject.set(this.state.values, e.target.name, e.target.value),
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
