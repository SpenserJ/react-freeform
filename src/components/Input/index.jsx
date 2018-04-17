import React from 'react';
import PropTypes from 'prop-types';

import { fakeChangeEvent } from '../../utilities';

class Input extends React.PureComponent {
  static propTypes = {
    type: PropTypes.string,
    value: PropTypes.any.isRequired, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
    'data-value': PropTypes.any, // eslint-disable-line react/forbid-prop-types
    'data-name': PropTypes.string.isRequired,
  };

  static defaultProps = {
    type: '',
    'data-value': undefined,
  };

  onCheckboxChange = e => this.props.onChange(fakeChangeEvent(e.target.name, e.target.checked));
  // Ignore the name for radios, since we need them for radio groups
  onRadioChange = e => this.props.onChange(e.target.value);

  render() {
    const { value, ...props } = this.props;
    let valueProp = { value };
    if (props.type === 'checkbox') {
      valueProp = { checked: value, onChange: this.onCheckboxChange };
    } else if (props.type === 'radio') {
      valueProp = {
        checked: value === this.props['data-value'],
        value,
        onChange: this.onRadioChange,
        name: this.props['data-name'],
      };
    }
    return <input {...props} {...valueProp} />;
  }
}

export default Input;
