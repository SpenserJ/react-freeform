import React from 'react';
import PropTypes from 'prop-types';
import immutableObject from 'object-path-immutable';

import { getDisplayName } from '../../utilities';

export default (WrappedComponent) => {
  if (!WrappedComponent.prototype.isReactComponent) {
    throw 'Cannot extend a pure component';
  }

  return class extends WrappedComponent {
    static displayName = `submit(${getDisplayName(WrappedComponent)})`;

    static childContextTypes = {
      ...(WrappedComponent.childContextTypes || {}),
      nfIsLoading: PropTypes.func.isRequired,
      nfCanSubmit: PropTypes.func.isRequired,
    }

    getChildContext() {
      const superChildContext = (typeof super.getChildContext === 'function')
        ? super.getChildContext()
        : {};
      return {
        ...superChildContext,
        nfIsLoading: () => this.isLoading(),
        nfCanSubmit: () => this.canSubmit(),
      };
    }

    onSubmitBound = (e) => {
      e.preventDefault();
      this.onSubmit();
    };

    /**
     * Respond to a valid submission being triggered
     * @param {object} values The form values
     * @public
     */
    onSubmit() {
      const values = this.getValue();
      if (super.onSubmit) { super.onSubmit(values); }
    }

    /**
     * Indicate whether a submission is already in-flight
     * @returns {bool}
     * @public
     */
    isLoading() {
      return super.isLoading ? super.isLoading() : false;
    }

    /**
     * Indicate whether the form can be submitted
     * @returns {bool}
     * @public
     */
    canSubmit() {
      if (super.canSubmit) { return super.canSubmit(); }
      return !this.isLoading();
    }

    formProps() {
      return {
        ...(super.formProps()),
        onSubmit: this.onSubmitBound,
      };
    }
  }
}
