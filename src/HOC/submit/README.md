The `submit` higher-order-component provides a simple interface for managing
form submissions, loading indicators, and blocking form submissions for any reason.

```jsx
const handler = require('react-freeform/HOC/handler/').default;
const submit = require('react-freeform/HOC/submit/').default;

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

const MyForm = submit(handler(MyFormBase));

<MyForm>
  <Label htmlFor="loading">Loading: <Field name="loading" type="checkbox" /></Label>
  <Label htmlFor="disableSubmit">Disable Submit: <Field name="disableSubmit" type="checkbox" /></Label>
  <CanSubmit>
    {({ canSubmit }) => <input type="submit" disabled={!canSubmit} />}
  </CanSubmit>
</MyForm>
```
