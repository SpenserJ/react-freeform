The `ValueSubscriber` is the base component of most others, however it may also
be used to nest form values.

```js
<ExampleForm defaultValues={{ nested: { values: 'Hello world' } }}>
  <ValueSubscriber name="nested">
    <Field name="values" />
  </ValueSubscriber>
</ExampleForm>
```

It can be easily extended for custom functionality, such as debugging form values

```js
class JSONValue extends ValueSubscriber {
  render() { return JSON.stringify(this.getValue()); }
}

<ExampleForm defaultValues={{ nested: { values: 'Hello world' } }}>
  <h4>Top Level</h4>
  <JSONValue />
  <h4>Nested</h4>
  <JSONValue name="nested" />
</ExampleForm>
```
