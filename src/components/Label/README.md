The `Label` will automatically connect the `htmlFor` attribute to a matching field
at this level in the form. If you have manually specified an ID on a field, this
component will not work, as it expects that IDs are handled by Freeform.

```js
const Label = require('react-freeform/components/Label/').default;
const ValueSubscriber = require('react-freeform/components/ValueSubscriber/').default;

<ExampleForm defaultValues={{ myField: 'Hello world', nested: { field: "I'm nested" } }}>
  <div>
    <Label htmlFor="myField">My Field's Label</Label>
    <Field name="myField" />
  </div>
  <ValueSubscriber name="nested">
    <div>
      <Label htmlFor="field">Nested Field's Label</Label>
      <Field name="field" />
    </div>
  </ValueSubscriber>
</ExampleForm>
```

You can pass in a `component` property to render a different base element than `<label>`

```js
const Label = require('react-freeform/components/Label/').default;

const FancyLabel = props => (
  <label {...props}><div style={{ width: '20px' }}>{props.children}</div></label>
);

<ExampleForm defaultValues={{ myField: 'Hello world' }}>
  <Label htmlFor="myField" component={FancyLabel}>My Field's Label</Label>
  <Field name="myField" />
</ExampleForm>
```

Properties other than component and htmlFor will be passed to the underlying component.

```js
const Label = require('react-freeform/components/Label/').default;

<ExampleForm defaultValues={{ myField: 'Hello world' }}>
  <Label htmlFor="myField" style={{ background: '#ccc', paddingRight: '20px' }}>My Field's Label</Label>
  <Field name="myField" />
</ExampleForm>
```
