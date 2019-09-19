import React from 'react';

export const FancyLabel = props => (
  <label {...props}><div style={{ border: '1px dotted' }}>{props.children}</div></label>
);
