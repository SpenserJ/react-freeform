import React from 'react';

import * as Freeform from 'react-freeform';

class TestForm extends React.Component {
  onSubmit(values) {
    console.log('Submitting', values);
  }

  getDefaults() {
    return {
      string: 'Hello',
      value2: 'World',
      checkbox: true,
      nested: {
        child1: "I'm a child",
        child2: 'So am I',
        radio: 'a',
      },
      passwords: {
        first: '',
        second: '',
      },
      array: [
        { a: '', b: '' },
      ],
      transform: [
        { value: 'test', group: 3 },
        { value: 'inner', group: 1 },
        { value: 'value', group: 3 },
      ],
      contextBlocked: 'Make me render',
    };
  }
}

const Handler = Freeform.handler(TestForm);
const Submit = Freeform.submit(Handler);
const WrappedClass = Freeform.valid(Submit);

class ContextBlocker extends React.PureComponent {
  render() {
    return <React.Fragment>{this.props.children}</React.Fragment>
  }
}

export default () => (
  <div>
    <WrappedClass>
      <h1>Hello Class</h1>
      <Freeform.Validation
        rules={(value, invalidate) => {
          if (!value.string) {
            invalidate('First field cannot be empty');
          }
        }}
      />
      <Freeform.Field name="string" />
      <Freeform.Field name="value2" />
      <Freeform.Field name="checkbox" type="checkbox" />
      <Freeform.ValueSubscriber name="nested">
        <Freeform.Field name="child1" />
        <Freeform.Field name="child2" />
        <Freeform.Field name="radio" value="a" type="radio" />
        <Freeform.Field name="radio" value="b" type="radio" />
        <Freeform.Field name="radio" value="c" type="radio" />
        <Freeform.Field name="radio2" value="1" type="radio" />
        <Freeform.Field name="radio2" value="2" type="radio" />
      </Freeform.ValueSubscriber>
      <Freeform.Validation
        name="passwords"
        rules={(value, invalidate) => {
          if (value.first !== value.second) {
            invalidate('Passwords do not match');
          }
        }}
      >
        <Freeform.Validation
          name="first"
          rules={(value, invalidate) => {
            if (!value) { invalidate('Password cannot be empty'); }
          }}
        >
          <Freeform.Field />
        </Freeform.Validation>
        <Freeform.Field name="second" />
      </Freeform.Validation>
      <Freeform.WithValue name="array">{value => JSON.stringify(value)}</Freeform.WithValue>
      <Freeform.WithValue name="array">
        {(values, { onChange }) => {
          const arrayFields = values.map((value, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <Freeform.ValueSubscriber name={i} key={i}>
              <li>
                <Freeform.Field name="a" />
                <Freeform.Field name="b" />
                {/* This should be memoized, but this is a simple example of deleting values */}
                <button onClick={() => onChange(values.slice(0, i).concat(values.slice(i + 1)))}>
                  Delete
                </button>
              </li>
            </Freeform.ValueSubscriber>
          ));
          return (
            <React.Fragment>
              <ul>{arrayFields}</ul>
              {/* Don't define a function in the render. This just serves as a simple example */}
              <button onClick={() => onChange(values.concat({ a: '', b: '' }))}>Add</button>
            </React.Fragment>
          );
        }}
      </Freeform.WithValue>
      <br />
      <Freeform.ValueTransformer
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
        <Freeform.WithValue>{value => JSON.stringify(value)}</Freeform.WithValue>
        <br />
        <Freeform.WithValue>
          {values => values.map((value, i) => (
            <Freeform.ValueSubscriber key={i} name={i}>
              <Freeform.Label htmlFor="group">Group: </Freeform.Label>
              <Freeform.Field name="group" />
              <Freeform.WithValue name="values">
                { items => JSON.stringify(items)}
              </Freeform.WithValue>
              <br />
            </Freeform.ValueSubscriber>
          ))}
        </Freeform.WithValue>
      </Freeform.ValueTransformer>
      <ContextBlocker>
        <h1>Context Blocked</h1>
        <Freeform.Field name="contextBlocked" />
      </ContextBlocker>
      <Freeform.CanSubmit>
        {val => (
          <div>
            {JSON.stringify(val)}
            <input type="submit" disabled={!val.canSubmit} />
          </div>
        )}
      </Freeform.CanSubmit>
    </WrappedClass>
  </div>
);
