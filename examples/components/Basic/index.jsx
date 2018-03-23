import React from 'react';

import * as Neoform from 'react-neoform';

class TestForm extends React.Component {
  getDefaults() {
    return {
      string: 'Hello',
      value2: 'World',
      checkbox: true,
    };
  }
}

const WrappedClass = Neoform.handler(TestForm);

export default () => (
  <div>
    <WrappedClass>
      <h1>Hello Class</h1>
      <Neoform.Field name="string" />
      <Neoform.Field name="value2" />
      <Neoform.Field name="checkbox" type="checkbox" />
    </WrappedClass>
  </div>
);
