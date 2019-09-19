import React from 'react';
import handler from '../../HOC/handler';
import submit from '../../HOC/submit';

class BaseForm extends React.Component {
  getDefaults() { return { submitToggle: false }; }
  canSubmit() { return this.state.values.submitToggle; }
}

export default submit(handler(BaseForm));
