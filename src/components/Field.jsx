import React from 'react';
import PropTypes from 'prop-types';

import Input from './Input';
import { fakeChangeEvent } from '../utilities';

export default class Field extends React.Component {
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
  };

  onChange = (e) => {
    this.context.injector().onChange(fakeChangeEvent(
      this.props.name ? [].concat(this.props.name) : [],
      e.target.value,
    ));
  }

  getValue = () => {
    const value = this.context.injector().getValue();
    if (!value) { return value; }
    return this.props.name ? value[this.props.name] : value;
  }

  getOtherProps() {
    const { name, component, ...otherProps } = this.props;
    return otherProps;
  }

  render() {
    const FieldType = this.props.component;
    console.log(this.context.injector().getValue());
    const fieldProps = {
      onChange: this.onChange,
      value: this.getValue(),
    };
    return (
      <FieldType
        {...fieldProps}
        {...this.getOtherProps()}
      />
    );
  }
}
