`WithValue` provides the value and some additional utilities to the child render
function. This can be used for mapping an array into a list, primarily for display
purposes, or for using onChange to change the values directly.

```js
<ExampleForm defaultValues={{ myArray: ['a', 'b', 'c'] }}>
  <WithValue name="myArray">
    {value => (
      <ul>
        {value.map(item => <li key={item}>{item}</li>)}
      </ul>
    )}
  </WithValue>
</ExampleForm>
```

### Using onChange to add and remove rows

```js
<ExampleForm defaultValues={{ myArray: ['First', 'Second', 'Third'] }}>
  <WithValue name="myArray">
    {(values, { onChange }) => {
      const arrayFields = values.map((value, i) => (
        <ValueSubscriber name={i} key={i}>
          <li>
            <Field />
            {/* This should be memoized, but this is a simple example of deleting values */}
            <button type="button" onClick={() => onChange(values.slice(0, i).concat(values.slice(i + 1)))}>
              Delete
            </button>
          </li>
        </ValueSubscriber>
      ));
      return (
        <React.Fragment>
          <ul>{arrayFields}</ul>
          {/* Don't define a function in the render. This just serves as a simple example */}
          <button type="button" onClick={() => onChange(values.concat(''))}>Add</button>
        </React.Fragment>
      );
    }}
  </WithValue>
</ExampleForm>
```
