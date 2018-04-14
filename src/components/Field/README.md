By default, the `Field` will render a text input.

```js
<ExampleForm defaultValues={{ myField: 'Hello world' }}>
  <Field name="myField" />
</ExampleForm>
```

Properties other than name and onChange will be passed to the underlying component. This allows you to set the input's `type` to any valid HTML5 value.

```js
<ExampleForm defaultValues={{ myField: true }}>
  <Field name="myField" type="checkbox" />
</ExampleForm>
```

You can also use the passthrough props to set attributes on the input, such as min and max.

```js
<ExampleForm defaultValues={{ myField: 2 }}>
  <Field name="myField" type="number" min="0" max="5" />
</ExampleForm>
```

If you want to use something other than an `<input>`, you can pass a string or component into the `component` property.

```js
const MySelect = ({ multiplier, ...props }) => (
  <select {...props}>
    <option>{1 * multiplier}</option>
    <option>{2 * multiplier}</option>
    <option>{3 * multiplier}</option>
    <option>{4 * multiplier}</option>
  </select>
);
<ExampleForm defaultValues={{ myField: 6 }}>
  <Field name="myField" component={MySelect} multiplier={3} />
</ExampleForm>
```
