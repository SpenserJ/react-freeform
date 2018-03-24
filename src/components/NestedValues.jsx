import React from 'react';
import PropTypes from 'prop-types';

import ValueSubscriber from './ValueSubscriber';

export default class NestedValues extends ValueSubscriber {
  static propTypes = {
    ...ValueSubscriber.propTypes,
    children: PropTypes.node.isRequired,
  };

  static childContextTypes = {
    injector: PropTypes.func.isRequired,
  };

  getChildContext() {
    return {
      injector: this.injector,
    };
  }

  injector = () => ({
    getValue: this.getValue,
    onChange: this.onChange,
  });
}
