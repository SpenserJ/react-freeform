import React from 'react';

import * as Freeform from 'react-freeform';

class TestForm extends React.Component {
  getDefaults() {
    return {
      string: 'Hello',
      value2: 'World',
      checkbox: true,
      nested: {
        child1: "I'm a child",
        child2: 'So am I',
      },
      passwords: {
        first: '',
        second: '',
      },
      array: [
        { a: '', b: '' },
      ],
      contextBlocked: 'Make me render',
    };
  }

  onSubmit(values) {
    console.log('Submitting', values);
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
        {values => values.map((value, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Freeform.ValueSubscriber name={i} key={i}>
            <Freeform.Field name="a" />
            <Freeform.Field name="b" />
          </Freeform.ValueSubscriber>
        ))}
      </Freeform.WithValue>
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
