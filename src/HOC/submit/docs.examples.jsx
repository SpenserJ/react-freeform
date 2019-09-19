import React from 'react';
import handler from '../handler';
import submit from '.';

class MyFormBase extends React.PureComponent {
  getDefaults() {
    return {
      loading: false,
      disableSubmit: false,
    };
  }

  isLoading() { return this.state.values.loading; }
  canSubmit() { return !(this.isLoading() || this.state.values.disableSubmit); }
  onSubmit(values) {
    alert(`Submitted values:\n${JSON.stringify(values, null, '  ')}`);
  }
}

export default submit(handler(MyFormBase));
