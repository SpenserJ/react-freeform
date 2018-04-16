import React from 'react';
import PropTypes from 'prop-types';

import { shallowCompare } from '../../utilities';

export class Subscription {
  constructor(subscriber, onChange) {
    this.subscriber = subscriber;
    this.updateSubscriber = onChange;
  }

  trySubscribe() {
    if (!this.subscriber.context || !this.subscriber.context.formSubscription) { return; }

    this.tryUnsubscribe();
    this.subscriber.context.formSubscription.subscribe(this.updateSubscriber);
  }

  tryUnsubscribe() {
    if (!this.subscriber.context || !this.subscriber.context.formSubscription) { return; }
    this.subscriber.context.formSubscription.unsubscribe(this.updateSubscriber);
  }
}

export default class Subscriber extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  };

  static defaultProps = {
    children: null,
  };

  static contextTypes = {
    formSubscription: PropTypes.objectOf(PropTypes.func).isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {};
    this.subscription = new Subscription(this, () => this.triggerUpdate());
  }

  componentDidMount() { this.subscription.trySubscribe(this.props); }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(nextProps, this.props) || shallowCompare(nextState, this.state);
  }

  componentWillUnmount() { this.subscription.tryUnsubscribe(); }

  triggerUpdate() { this.setState({}); }

  render() {
    return <React.Fragment>{this.props.children}</React.Fragment>;
  }
}
