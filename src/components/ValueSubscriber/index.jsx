import PropTypes from 'prop-types';
import invariant from 'invariant';
import objectPath from 'object-path';

import { fakeChangeEvent } from '../../utilities';
import Subscriber from '../Subscriber/';

const invariantTypesMatch = (name, oldVal, newVal) => {
  let changingType = false;
  if (oldVal === null || newVal === null || typeof oldVal === 'undefined' || typeof newVal === 'undefined') { return; }
  if (typeof oldVal === 'object') {
    if (oldVal && newVal) {
      const c = 'constructor'; // Shorthand for constructor
      changingType = (oldVal[c] && newVal[c] && oldVal[c] === newVal[c])
        ? false
        : `Cannot convert between two object types: ${oldVal.constructor} !== ${newVal.constructor}`;
      if (changingType === false) {
        // Compare child values
        if (oldVal.constructor === ({}).constructor) {
          Object.keys(oldVal)
            .forEach(key => invariantTypesMatch(name.concat(key), oldVal[key], newVal[key]));
        } else if (Array.isArray(oldVal)) {
          oldVal.forEach((_, i) => invariantTypesMatch(name.concat(i), oldVal[i], newVal[i]));
        }
      }
    }
  } else {
    changingType = (typeof oldVal !== typeof newVal)
      ? `Cannot convert ${name.join('.')} from ${typeof oldVal} to ${typeof newVal}`
      : false;
  }
  invariant(!changingType, changingType);
};

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
    nfGetValue: PropTypes.func.isRequired,
    nfOnChange: PropTypes.func.isRequired,
    nfFullName: PropTypes.func.isRequired,
  };

  static childContextTypes = {
    nfGetValue: PropTypes.func.isRequired,
    nfFullName: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.oldValue = undefined;
  }

  getChildContext() {
    return {
      nfGetValue: () => this.getValue(),
      nfFullName: this.getName,
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
    invariantTypesMatch(this.getName().concat(name), objectPath.get(this.getValue(), name), value);

    this.context.nfOnChange(fakeChangeEvent(this.getName().concat(name), value));
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
    const value = this.context.nfGetValue();
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
    const parentName = this.context.nfFullName();
    if (typeof this.props.name === 'undefined' || this.props.name === '') { return parentName; }
    return parentName.concat(this.props.name);
  };

  // Super render for supporting react-docgen
  render() { return super.render(); }
}
