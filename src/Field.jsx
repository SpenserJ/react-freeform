import React from 'react';
import PropTypes from 'prop-types';

import { fakeChangeEvent } from './utilities';

export default class Field extends React.Component {
  static propTypes = {
    name: PropTypes.string,
  };

  static defaultProps = {
    name: '',
  };

  static contextTypes = {
    injector: PropTypes.func.isRequired,
  };

  getValue = () => {
    const value = this.context.injector().getValue();
    if (!value) { return value; }
    return this.props.name ? value[this.props.name] : value;
  }

  onChange = (e) => {
    console.log(this.props.name, e.target.value)
    const value = (this.props.type === 'checkbox')
      ? e.target.checked
      : e.target.value;
    this.context.injector().onChange(fakeChangeEvent(
      this.props.name ? [].concat(this.props.name) : [],
      value,
    ));
  }

  getOtherProps() {
    const { name, ...otherProps } = this.props;
    return otherProps;
  }

  render() {
    const FieldType = this.props.component || 'input';
    console.log(this.context.injector().getValue());
    const fieldProps = {
      onChange: this.onChange,
      [this.props.type === 'checkbox' ? 'checked' : 'value']: this.getValue(),
    };
    return (
      <FieldType
        {...fieldProps}
        {...this.getOtherProps()}
      />
    );
  }
}
