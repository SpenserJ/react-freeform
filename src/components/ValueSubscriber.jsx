import PropTypes from 'prop-types';

import { fakeChangeEvent } from '../utilities';
import Subscriber from './Subscriber';

export default class ValueSubscriber extends Subscriber {
  static propTypes = {
    ...Subscriber.propTypes,
    name: PropTypes.string,
  };

  static defaultProps = {
    ...Subscriber.defaultProps,
    name: '',
  };

  static contextTypes = {
    ...Subscriber.contextTypes,
    injector: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.oldValue = undefined;
  }

  componentDidMount() {
    super.componentDidMount();
    this.oldValue = this.getValue();
  }

  onChange = (e) => {
    this.context.injector().onChange(fakeChangeEvent(
      [this.props.name].concat(e.target.name).filter(v => !!v),
      e.target.value,
    ));
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

  getValue = () => {
    const value = this.context.injector().getValue();
    if (!value) { return value; }
    return this.props.name ? value[this.props.name] : value;
  }
}
