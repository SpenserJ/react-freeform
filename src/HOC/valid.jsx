import React from 'react';
import PropTypes from 'prop-types';
import immutableObject from 'object-path-immutable';

import { getDisplayName } from '../utilities';

export default (WrappedComponent) => {
  if (!WrappedComponent.prototype.isReactComponent) {
    throw 'Cannot extend a pure component';
  }

  return class extends WrappedComponent {
    static displayName = `valid(${getDisplayName(WrappedComponent)})`;

    static childContextTypes = {
      ...(WrappedComponent.childContextTypes || {}),
      nfUpdateValidation: PropTypes.func.isRequired,
    }

    constructor(props, context) {
      super(props, context);
      this.state = {
        ...(this.state || {}),
        validationResults: [],
      };
      this.dirtyValidationResults = [];
    }

    getChildContext() {
      const superChildContext = (typeof super.getChildContext === 'function')
        ? super.getChildContext()
        : {};
      return {
        ...superChildContext,
        nfUpdateValidation: this.updateValidation,
      };
    }

    updateValidation = (oldValidation, newValidation) => {
      const validationResults = this.dirtyValidationResults.filter(v => v !== oldValidation);
      if (newValidation.length !== 0) { validationResults.push(newValidation); }
      this.dirtyValidationResults = validationResults;
      this.setState({ validationResults }, () => this.triggerUpdate());
    }

    canSubmit() {
      if (super.canSubmit() === false) { return false; }
      return this.state.validationResults.length === 0;
    }
  };
};
