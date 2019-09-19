import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';

import ValueTransformer from '.';

const values = {
  number: 1,
  json: JSON.stringify({ nested: 'value' }),
};

const noop = v => v;
const context = {
  ffOnChange: noop,
  ffGetValue: () => values,
  ffFullName: () => ([]),
  formSubscription: { subscribe: noop, unsubscribe: noop },
};

describe('components/ValueTransformer', () => {
  test('changes values being passed down', () => {
    const wrapper = shallow((
      <ValueTransformer
        name="number"
        transformOnChange={noop}
        transformValue={v => v * 2}
      />
    ), { context });
    const component = wrapper.instance();
    expect(component.getChildContext().ffGetValue()).toBe(2);
  });

  test('changes values from onChange', () => {
    const onChange = sinon.spy();
    const wrapper = shallow((
      <ValueTransformer
        name="number"
        transformOnChange={v => v * 2}
        transformValue={noop}
      />
    ), {
      context: { ...context, ffOnChange: onChange },
    });
    const component = wrapper.instance();
    component.getChildContext().ffOnChange({ target: { name: ['number'], value: 1 } });
    expect(onChange.getCall(0).args[0].target.value).toBe(2);
  });

  test('allows the type to change in transformOnChange', () => {
    const onChange = sinon.spy();
    const wrapper = shallow((
      <ValueTransformer
        name="json"
        transformOnChange={v => JSON.stringify(v)}
        transformValue={noop}
      />
    ), {
      context: { ...context, ffOnChange: onChange },
    });
    const component = wrapper.instance();
    component.getChildContext()
      .ffOnChange({ target: { name: ['json'], value: { nested: 'changed' } } });
    expect(onChange.getCall(0).args[0].target.value).toBe(JSON.stringify({ nested: 'changed' }));
  });
});
