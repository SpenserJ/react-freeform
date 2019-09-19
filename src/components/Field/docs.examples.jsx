import React from 'react';

const MySelect = ({ multiplier, ...props }) => (
  <select {...props}>
    <option>{1 * multiplier}</option>
    <option>{2 * multiplier}</option>
    <option>{3 * multiplier}</option>
    <option>{4 * multiplier}</option>
  </select>
);

export default MySelect;
