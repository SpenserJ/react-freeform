The `ValueSubscriber` is the base component of most others, however it may also
be used to nest form values.

```js
const Form = require('../../../examples/wrapper').default;
<Form defaultValues={{ nested: { values: 'Hello world' } }}>
  <ValueSubscriber name="nested">
    <Field name="values" />
  </ValueSubscriber>
</Form>
```

It can be easily extended for custom functionality, such as debugging form values

```js
const Form = require('../../../examples/wrapper').default;
class JSONValue extends ValueSubscriber {
  render() { return JSON.stringify(this.getValue()); }
}

<Form defaultValues={{ nested: { values: 'Hello world' } }}>
  <h4>Top Level</h4>
  <JSONValue />
  <h4>Nested</h4>
  <JSONValue name="nested" />
</Form>
```
