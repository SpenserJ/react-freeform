import PropTypes from 'prop-types';
import immutableObject from 'object-path-immutable';
import ValueSubscriber from '../ValueSubscriber/';

export default class ValueTransformer extends ValueSubscriber {
  static propTypes = {
    ...ValueSubscriber.propTypes,
    /**
     * Transform a value back into the submission format
     * @param {any} value The value as seen by the children
     * @returns {any} The value as seen by the parents
     */
    transformOnChange: PropTypes.func.isRequired,
    /**
     * Transform a value into a format for rendering
     * @param {any} value The value as seen by the parents
     * @returns {any} The value as seen by the children
     */
    transformValue: PropTypes.func.isRequired,
  }

  static childContextTypes = {
    ...ValueSubscriber.childContextTypes,
    nfOnChange: PropTypes.func.isRequired,
  }

  getChildContext() {
    return {
      ...super.getChildContext(),
      nfOnChange: e => this.onChange(e),
    };
  }

  onChange(e) {
    const name = e.target.name.slice(this.getName().length);
    const value = immutableObject.set(this.getValue(), name, e.target.value);
    const newValue = this.props.transformOnChange(value);
    super.onChange(newValue);
  }

  getValue() {
    const value = super.getValue();
    return this.props.transformValue(value);
  }

  // Super render for supporting react-docgen
  render() { return super.render(); }
}
