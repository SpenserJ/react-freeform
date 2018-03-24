import React from 'react';
import PropTypes from 'prop-types';

import { fakeChangeEvent } from '../utilities';
import Subscription from '../subscription';

export default class ValueSubscriber extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string,
    children: PropTypes.node,
  };

  static defaultProps = {
    name: '',
    children: null,
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

  componentWillUnmount() {
    this.subscription.tryUnsubscribe();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.name !== nextProps.name) {
      // TODO: Is this even required, since we're not keying by name?
      this.subscription.trySubscribe();
    }
  }

  onChange = (e) => {
    this.context.injector().onChange(fakeChangeEvent(
      [this.props.name].concat(e.target.name).filter(v => !!v),
      e.target.value,
    ));
  }

  getValue = () => this.subscription.getValue();

  render() {
    return <React.Fragment>{this.props.children}</React.Fragment>;
  }
}
