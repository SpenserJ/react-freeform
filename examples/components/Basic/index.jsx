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
        { value: 'test', weight: 3 },
        { value: 'inner', weight: 1 },
        { value: 'value', weight: 3 },
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
          acc.concat(next.values.map(value => ({ value, weight: next.weight })))
        ), [])}
        transformValue={values => Object.values(values.reduce((acc, next) => {
          if (!acc[next.weight]) {
            acc[next.weight] = { values: [], weight: next.weight };
          }
          acc[next.weight].values.push(next.value);
          return acc;
        }, {}))}
      >
        <Freeform.WithValue>{value => JSON.stringify(value)}</Freeform.WithValue>
        <br />
        <Freeform.WithValue>
          { values => values.map((value, i) => (
            <Freeform.ValueSubscriber key={i} name={i}>
              <Freeform.Field name="weight" />
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
