import React from 'react';
import PropTypes from 'prop-types';

import Input from './Input';
import { fakeChangeEvent } from '../utilities';
import Subscription from '../subscription';

export default class Field extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string,
    component: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
  };

  static defaultProps = {
    name: '',
    component: Input,
  };

  static contextTypes = {
    injector: PropTypes.func.isRequired,
    formSubscription: PropTypes.objectOf(PropTypes.func).isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = { renderTrigger: true };
    this.subscription = new Subscription(
      this,
      props.name,
      () => this.setState({ renderTrigger: !this.state.renderTrigger }),
    );
  }

  componentDidMount() {
    this.subscription.trySubscribe(this.props.name);
  }

  onChange = (e) => {
    this.context.injector().onChange(fakeChangeEvent(
      this.props.name ? [].concat(this.props.name) : [],
      e.target.value,
    ));
  }

  getOtherProps() {
    const { name, component, ...otherProps } = this.props;
    return otherProps;
  }

  render() {
    const FieldType = this.props.component;
    const fieldProps = {
      onChange: this.onChange,
      value: this.subscription.getValue(),
    };
    console.log('rendering', this.props.name)
    return (
      <FieldType
        {...fieldProps}
        {...this.getOtherProps()}
      />
    );
  }
}
