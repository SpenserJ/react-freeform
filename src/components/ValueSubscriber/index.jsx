import PropTypes from 'prop-types';
import invariant from 'invariant';
import objectPath from 'object-path';

import { fakeChangeEvent, invariantTypesMatch } from '../../utilities';
import Subscriber from '../Subscriber';

export default class ValueSubscriber extends Subscriber {
  static propTypes = {
    ...Subscriber.propTypes,
    /**
     * The name to use to fetch values from.
     */
    name: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  };

  static defaultProps = {
    ...Subscriber.defaultProps,
    name: '',
  };

  static contextTypes = {
    ...Subscriber.contextTypes,
    ffGetValue: PropTypes.func.isRequired,
    ffOnChange: PropTypes.func.isRequired,
    ffFullName: PropTypes.func.isRequired,
  };

  static childContextTypes = {
    ffGetValue: PropTypes.func.isRequired,
    ffFullName: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.oldValue = undefined;
  }

  getChildContext() {
    return {
      ffGetValue: () => this.getValue(),
      ffFullName: this.getName,
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.oldValue = this.getValue();
  }

  onChange(e) {
    let name = [];
    let value = e;
    if (e && e.target) {
      if (typeof e.target.name !== 'undefined' && e.target.name !== '') {
        name = name.concat(e.target.name);
      }
      value = e.target.value; // eslint-disable-line prefer-destructuring
    }

    // Convert to a number if the current value is a number. Inputs only use
    // string values by default, and this usually introduces some confusion.
    if (typeof objectPath.get(this.getValue(), name) === 'number') {
      const parsed = parseInt(value, 10);
      if (Number.isInteger(parsed)) { value = parsed; }
    }

    // Check to make sure we aren't changing the value's type
    this.invariantTypesMatch(name, value);

    this.context.ffOnChange(fakeChangeEvent(this.getName().concat(name), value));
  }

  invariantTypesMatch(name, value) {
    invariantTypesMatch(this.getName().concat(name), objectPath.get(this.getValue(), name), value);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (super.shouldComponentUpdate(nextProps, nextState)) { return true; }

    const newValue = this.getValue();
    if (newValue !== this.oldValue) {
      this.oldValue = newValue;
      return true;
    }

    return false;
  }

  /**
   * Get the value at this form level
   * @returns {any}
   * @public
   */
  getValue() {
    const hasName = (typeof this.props.name !== 'undefined' && this.props.name !== '');
    const value = this.context.ffGetValue();
    invariant(
      typeof value !== 'undefined' && (!hasName || typeof value[this.props.name] !== 'undefined'),
      `"${this.getName().join('.')}" must have a value. Please check the handler's getDefaults() method.`,
    );
    return hasName ? value[this.props.name] : value;
  }

  /**
   * Get the name at this form level
   * @returns {array} Array of the names, including (grand)parents
   * @public
   */
  getName = () => {
    const parentName = this.context.ffFullName();
    if (typeof this.props.name === 'undefined' || this.props.name === '') { return parentName; }
    return parentName.concat(this.props.name);
  };

  // Super render for supporting react-docgen
  render() { return super.render(); }
}
