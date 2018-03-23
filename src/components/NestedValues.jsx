import React from 'react';
import PropTypes from 'prop-types';

import { fakeChangeEvent } from '../utilities';

export default class NestedValues extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
  };

  static contextTypes = {
    injector: PropTypes.func.isRequired,
  };

  static childContextTypes = {
    injector: PropTypes.func.isRequired,
  };

  getChildContext() {
    return {
      injector: this.injector,
    };
  }


  onChange = (e) => {
    this.context.injector().onChange(fakeChangeEvent(
      [this.props.name].concat(e.target.name),
      e.target.value,
    ));
  }

  getValue = () => {
    const value = this.context.injector().getValue();
    return value ? value[this.props.name] : value;
  }

  injector = () => ({
    getValue: this.getValue,
    onChange: this.onChange,
  });

  render() {
    return <React.Fragment>{this.props.children}</React.Fragment>;
  }
}
