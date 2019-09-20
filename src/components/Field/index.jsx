import React from 'react';
import PropTypes from 'prop-types';

import ValueSubscriber from '../ValueSubscriber';
import Input from '../Input';

export default class Field extends ValueSubscriber {
  static propTypes = {
    ...ValueSubscriber.propTypes,
    /**
     * What component to use for displaying the field itself
     */
    component: PropTypes.elementType,
  };

  static defaultProps = {
    ...ValueSubscriber.defaultProps,
    component: Input,
  };

  static contextTypes = {
    ...ValueSubscriber.contextTypes,
    ffFormIndex: PropTypes.number.isRequired,
  }

  getOtherProps() {
    const {
      name,
      component,
      onChange,
      ...otherProps
    } = this.props;
    return otherProps;
  }

  boundOnChange = e => this.onChange(e)

  render() {
    const FieldType = this.props.component;
    const otherProps = this.getOtherProps();
    const fieldProps = {
      onChange: this.boundOnChange,
      value: this.getValue(),
      'data-name': this.getName().join('.'),
      id: `${this.context.ffFormIndex}.${this.getName().join('.')}`,
    };
    if (typeof otherProps.value !== 'undefined') {
      fieldProps['data-value'] = fieldProps.value;
    }
    return (
      <FieldType
        {...fieldProps}
        {...otherProps}
      />
    );
  }
}
