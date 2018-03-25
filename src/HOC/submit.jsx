import React from 'react';
import PropTypes from 'prop-types';
import immutableObject from 'object-path-immutable';

import { getDisplayName } from '../utilities';

export default (WrappedComponent) => {
  if (!WrappedComponent.prototype.isReactComponent) {
    throw 'Cannot extend a pure component';
  }

  return class extends WrappedComponent {
    static displayName = `submit(${getDisplayName(WrappedComponent)})`;

    onSubmitBound = (e) => {
      e.preventDefault();
      this.onSubmit();
    };

    onSubmit() {
      const values = this.getValue();
      if (super.onSubmit) { super.onSubmit(values); }
    }

    isLoading() {
      return super.isLoading ? super.isLoading() : false;
    }

    canSubmit() {
      if (super.canSubmit) { return super.canSubmit(); }
      return this.isLoading() && this.isValid();
    }

    formProps() {
      return {
        ...(super.formProps()),
        onSubmit: this.onSubmitBound,
      };
    }
  }
}
