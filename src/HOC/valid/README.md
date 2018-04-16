The `valid` higher-order-component handles all of the logic for the `Validation`
component, and will set `canSubmit` from the `submit` HOC to false if any
validation fails.

```jsx
const handler = require('react-freeform/HOC/handler/').default;
const submit = require('react-freeform/HOC/submit/').default;
const valid = require('react-freeform/HOC/valid/').default;

class MyFormBase extends React.PureComponent {
  getDefaults() {
    return { myField: '' };
  }

  onSubmit(values) {
    alert(`Submitted values:\n${JSON.stringify(values, null, '  ')}`);
  }
}

const MyForm = valid(submit(handler(MyFormBase)));

<MyForm>
  <Validation
    name="myField"
    rules={(value, invalidate) => { if (!value) invalidate('Cannot be empty'); }}
  >
    <Field />
  </Validation>
  <br />
  <WithSubmit>
    {({ canSubmit }) => <input type="submit" disabled={!canSubmit} />}
  </WithSubmit>
</MyForm>
```
