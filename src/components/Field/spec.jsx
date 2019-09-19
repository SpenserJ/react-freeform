import React from 'react';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';

import Field from '.';

const values = {
  a: true,
  b: null,
  c: ['1', '2'],
  d: {
    d1: 'nested',
  },
};

const noop = () => {};
const context = {
  ffGetValue: () => values,
  ffFullName: () => ([]),
  ffFormIndex: 1,
  ffOnChange: noop,
  formSubscription: { subscribe: noop, unsubscribe: noop },
};

describe('components/Field', () => {
  test('should filter out internal props from the passthrough props', () => {
    const wrapper = shallow(<Field name="a" component="input" onChange={noop} a="1" />, { context });
    expect(wrapper.instance().getOtherProps()).toEqual({ a: '1', children: null });
  });

  test('should support overriding the input component', () => {
    expect(mount(<Field />, { context }).find('input').length).toBe(1);

    const TestInput = () => <h1>Test</h1>;
    const wrapper = shallow(<Field component={TestInput} />, { context });
    expect(wrapper.find('input').length).toBe(0);
    expect(wrapper.find(TestInput).length).toBe(1);
  });

  test(
    'should pass data-value with the true value, if it receives value as a prop',
    () => {
      const wrapper = mount(<Field value="test" name="a" />, { context });
      const input = wrapper.find('input');
      expect(input.props()).toHaveProperty('value', 'test');
      expect(input.props()).toHaveProperty('data-value', true);
    },
  );

  test('should pass data-name as a string of the entire form path', () => {
    expect(mount(<Field value="test" name="a" />, { context }).find('input').props()).toHaveProperty('data-name', 'a');
    expect(mount(
      <Field value="test" name="d1" />,
      { context: { ...context, ffFullName: () => (['d']), ffGetValue: () => ({ d1: 'test' }) } },
    ).find('input').props()).toHaveProperty('data-name', 'd.d1');
  });

  test(
    'should pass id as a string of the entire form path with a form identifier',
    () => {
      expect(mount(<Field value="test" name="a" />, { context }).find('input').props()).toHaveProperty('id', '1.a');
      expect(mount(
        <Field value="test" name="d1" />,
        { context: { ...context, ffFullName: () => (['d']), ffGetValue: () => ({ d1: 'test' }) } },
      ).find('input').props()).toHaveProperty('id', '1.d.d1');
    },
  );

  test('should pass a working onChange into the input', () => {
    const ffOnChange = sinon.spy();
    const input = mount(<Field name="a" />, { context: { ...context, ffOnChange } }).find('input');
    input.simulate('change', { target: { name: '', value: false } });
    expect(ffOnChange.calledOnce).toBe(true);
    expect(ffOnChange.args[0][0].target).toEqual({ name: ['a'], value: false });
  });
});
