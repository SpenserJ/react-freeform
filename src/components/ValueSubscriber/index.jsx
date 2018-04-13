import PropTypes from 'prop-types';

import { fakeChangeEvent } from '../../utilities';
import Subscriber from '../Subscriber/';

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
    let name = this.getName();
    let value = e;
    if (e && e.target) {
      if (typeof e.target.name !== 'undefined' && e.target.name !== '') {
        name = name.concat(e.target.name);
      }
      value = e.target.value; // eslint-disable-line prefer-destructuring
    }
    this.context.nfOnChange(fakeChangeEvent(name, value));
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (super.shouldComponentUpdate(nextProps, nextState, nextContext)) { return true; }

    const newValue = this.getValue();
    if (newValue !== this.oldValue) {
      this.oldValue = newValue;
      return true;
    }

    return false;
  }

  getValue() {
    const value = this.context.nfGetValue();
    if (!value) { return value; }
    return (typeof this.props.name !== 'undefined' && this.props.name !== '')
      ? value[this.props.name]
      : value;
  }

  getName = () => {
    const parentName = this.context.nfFullName();
    if (typeof this.props.name === 'undefined' || this.props.name === '') { return parentName; }
    return parentName.concat(this.props.name);
  };

  // Super render for supporting react-docgen
  render() { return super.render(); }
}
