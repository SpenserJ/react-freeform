import React from 'react';
import PropTypes from 'prop-types';

import ValueSubscriber from './ValueSubscriber';

export default class WithValue extends ValueSubscriber {
  static propTypes = {
    ...ValueSubscriber.propTypes,
    children: PropTypes.func.isRequired,
  };

  static defaultProps = {
    ...ValueSubscriber.defaultProps,
  };

  render() {
    return <React.Fragment>{this.props.children(this.getValue())}</React.Fragment>;
  }
}
