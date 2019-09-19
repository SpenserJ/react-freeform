import React from 'react';
import handler from '.';
import Field from '../../components/Field';

class MyFormBase extends React.PureComponent {
  getDefaults() {
    return {
      some: 'Hello',
      fields: 'World',
    };
  }
}
export const MyForm = handler(MyFormBase);

class MyRenderedFormBase extends MyFormBase {
  render() {
    return (
      <>
        <Field name="some" />
        <Field name="fields" />
      </>
    );
  }
}
export const MyRenderedForm = handler(MyRenderedFormBase);

class MyStyledFormBase extends MyFormBase {
  formProps() {
    return {
      style: { background: '#ccc', padding: '20px' },
    }
  }
}
export const MyStyledForm = handler(MyStyledFormBase);
