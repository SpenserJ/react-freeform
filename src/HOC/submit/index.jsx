import PropTypes from 'prop-types';
import invariant from 'invariant';

import { getDisplayName } from '../../utilities';

export default (WrappedComponent) => {
  invariant(WrappedComponent.prototype.isReactComponent, 'Cannot extend a functional component');

  return class extends WrappedComponent {
    static displayName = `submit(${getDisplayName(WrappedComponent)})`;

    static childContextTypes = {
      ...(WrappedComponent.childContextTypes || {}),
      ffIsLoading: PropTypes.func.isRequired,
      ffCanSubmit: PropTypes.func.isRequired,
    }

    getChildContext() {
      const superChildContext = (typeof super.getChildContext === 'function')
        ? super.getChildContext()
        : {};
      return {
        ...superChildContext,
        ffIsLoading: () => this.isLoading(),
        ffCanSubmit: () => this.canSubmit(),
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
        ...(super.formProps ? super.formProps() : {}),
        onSubmit: this.onSubmitBound,
      };
    }
  };
};
