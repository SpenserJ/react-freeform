
`WithSubmit` may be used to gather information on the status of the form. This is most
often used to disable a submit button based on the validation or loading status. It
requires that the form has been wrapped in the `submit` HOC.

```js
const handler = require('react-freeform/HOC/handler').default;
const submit = require('react-freeform/HOC/submit').default;
const WithSubmit = require('react-freeform/components/WithSubmit/').default;

class BaseForm extends React.Component {
  getDefaults() { return { submitToggle: false }; }
  canSubmit() { return this.state.values.submitToggle; }
}
const Form = submit(handler(BaseForm));

<Form>
  <Field name="submitToggle" type="checkbox" />
  <WithSubmit>
    {({ canSubmit, isLoading }) => (
      <input type="submit" value="Submit" disabled={!canSubmit || isLoading} />
    )}
  </WithSubmit>
</Form>
```
