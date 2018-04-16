The `ValueTransformer` allows you to use different values for rendering than you
use for your form submissions. This may be used for grouping values into a cleaner
interface, for displaying phone masks, or even converting a group of values into
a JSON string for submission.

```js
<ExampleForm defaultValues={{ transform: '{"lookMa":"No JSON here!"}' }}>
  <ValueTransformer
    name="transform"
    transformOnChange={value => JSON.stringify(value)}
    transformValue={value => JSON.parse(value)}
  >
    <Field name="lookMa" />
  </ValueTransformer>
</ExampleForm>
```

### Advanced Usage

```js
<ExampleForm
  defaultValues={{
    transform: [
      { value: 'test', group: '3' },
      { value: 'inner', group: '1' },
      { value: 'value', group: '3' },
    ],
  }}
>
  <ValueTransformer
    name="transform"
    transformOnChange={values => values.reduce((acc, next) => (
      acc.concat(next.values.map(value => ({ value, group: next.group })))
    ), [])}
    transformValue={(values) => {
      // Transformed will be an ordered array
      const transformed = [];
      // We use a reduce into an object, keyed by our group property to reduce
      // the time spent looking for an existing group
      values.reduce((acc, next) => {
        if (!acc[next.group]) {
          // If we haven't seen this group before, add it to the object and push
          // the new object into our ordered array.
          acc[next.group] = { values: [], group: next.group };
          transformed.push(acc[next.group]);
        }
        // Push the value into the group
        acc[next.group].values.push(next.value);
        return acc;
      }, {});
      return transformed;
    }}
  >
    <h4>Values after transformation</h4>
    <WithValue>{value => <pre>{JSON.stringify(value, null, '  ')}</pre>}</WithValue>
    <br />
    <WithValue>
      {values => values.map((value, i) => (
        <ValueSubscriber key={i} name={i}>
          <Label htmlFor="group">Group: </Label>
          <Field name="group" />
          <WithValue name="values">
            { items => JSON.stringify(items)}
          </WithValue>
          <br />
        </ValueSubscriber>
      ))}
    </WithValue>
  </ValueTransformer>
</ExampleForm>
```
