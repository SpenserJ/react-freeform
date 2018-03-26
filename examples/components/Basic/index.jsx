import React from 'react';

import * as Neoform from 'react-neoform';

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
      contextBlocked: 'Make me render',
    };
  }

  onSubmit(values) {
    console.log('Submitting', values);
  }
}

const Handler = Neoform.handler(TestForm);
const WrappedClass = Neoform.submit(Handler);

class ContextBlocker extends React.PureComponent {
  render() {
    return <React.Fragment>{this.props.children}</React.Fragment>
  }
}

export default () => (
  <div>
    <WrappedClass>
      <h1>Hello Class</h1>
      <Neoform.Field name="string" />
      <Neoform.Field name="value2" />
      <Neoform.Field name="checkbox" type="checkbox" />
      <Neoform.NestedValues name="nested">
        <Neoform.Field name="child1" />
        <Neoform.Field name="child2" />
      </Neoform.NestedValues>
      <ContextBlocker>
        <h1>Context Blocked</h1>
        <Neoform.Field name="contextBlocked" />
      </ContextBlocker>
      <Neoform.CanSubmit>{(val) => JSON.stringify(val)}</Neoform.CanSubmit>
      <input type="submit" />
    </WrappedClass>
  </div>
);
