import React from 'react';
import PropTypes from 'prop-types';

import ValueSubscriber from './ValueSubscriber';
import Input from './Input';

export default class Field extends ValueSubscriber {
  static propTypes = {
    ...ValueSubscriber.propTypes,
    component: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
  };

  static defaultProps = {
    ...ValueSubscriber.defaultProps,
    component: Input,
  };

  getOtherProps() {
    const { name, component, ...otherProps } = this.props;
    return otherProps;
  }

  boundOnChange = e => this.onChange(e)

  render() {
    const FieldType = this.props.component;
    const fieldProps = {
      onChange: this.boundOnChange,
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
