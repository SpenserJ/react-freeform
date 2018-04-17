import React from 'react';
import PropTypes from 'prop-types';

import ValueSubscriber from '../ValueSubscriber/';

export default class WithValue extends ValueSubscriber {
  static propTypes = {
    ...ValueSubscriber.propTypes,
    /**
     * A render function that will receive the current value and the onChange callback.
     * @param {Any} value The current value at this level of the form
     * @param {Object} utilities An object containing the onChange callback
     */
    children: PropTypes.func.isRequired,
  };

  render() {
    return (
      <React.Fragment>{this.props.children(
        this.getValue(),
        { onChange: e => this.onChange(e) },
      )}
      </React.Fragment>
    );
  }
}
