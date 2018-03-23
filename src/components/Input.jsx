import React from 'react';
import PropTypes from 'prop-types';

import { fakeChangeEvent } from '../utilities';

class Input extends React.PureComponent {
  static propTypes = {
    type: PropTypes.string,
    value: PropTypes.any.isRequired, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    type: '',
  };

  onCheckboxChange = e => this.props.onChange(fakeChangeEvent(e.target.name, e.target.checked));

  render() {
    const { value, ...props } = this.props;
    const valueProp = (props.type === 'checkbox')
      ? { checked: value, onChange: this.onCheckboxChange }
      : { value };
    return <input {...props} {...valueProp} />;
  }
}

export default Input;
