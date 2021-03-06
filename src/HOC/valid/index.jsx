import PropTypes from 'prop-types';
import invariant from 'invariant';

import { getDisplayName } from '../../utilities';

export default (WrappedComponent) => {
  invariant(WrappedComponent.prototype.isReactComponent, 'Cannot extend a functional component');

  return class extends WrappedComponent {
    static displayName = `valid(${getDisplayName(WrappedComponent)})`;

    static childContextTypes = {
      ...(WrappedComponent.childContextTypes || {}),
      ffUpdateValidation: PropTypes.func.isRequired,
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
        ffUpdateValidation: this.updateValidation,
      };
    }

    updateValidation = (oldValidation, newValidation) => {
      const validationResults = this.dirtyValidationResults.filter(v => v !== oldValidation);
      if (newValidation.length !== 0) { validationResults.push(newValidation); }
      this.dirtyValidationResults = validationResults;
      this.setState({ validationResults }, () => this.triggerUpdate());
    }

    canSubmit() {
      if (super.canSubmit && super.canSubmit() === false) { return false; }
      return this.state.validationResults.length === 0;
    }
  };
};
