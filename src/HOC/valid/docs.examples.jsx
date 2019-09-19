import React from 'react';
import handler from '../handler';
import submit from '../submit';
import valid from '.';

class MyFormBase extends React.PureComponent {
  getDefaults() {
    return { myField: '' };
  }

  onSubmit(values) {
    alert(`Submitted values:\n${JSON.stringify(values, null, '  ')}`);
  }
}

export default valid(submit(handler(MyFormBase)));
