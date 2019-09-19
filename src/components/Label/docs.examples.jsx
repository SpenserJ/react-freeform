import React from 'react';

const FancyLabel = props => (
  // eslint-disable-next-line jsx-a11y/label-has-associated-control
  <label {...props}>
    <div style={{ border: '1px dotted' }}>
      {props.children}
    </div>
  </label>
);

export default FancyLabel;
