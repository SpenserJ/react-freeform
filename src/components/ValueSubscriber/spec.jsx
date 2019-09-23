import React from 'react';
import { shallow, mount } from 'enzyme';

import ValueSubscriber from '.';

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
  ffOnChange: noop,
  ffGetValue: () => values,
  ffFullName: () => ([]),
  formSubscription: { subscribe: noop, unsubscribe: noop },
};

describe('components/ValueSubscriber', () => {
  test('provides access to the form values without a name', () => {
    const wrapper = shallow(<ValueSubscriber />, { context });
    const component = wrapper.instance();
    expect(component.getChildContext().ffGetValue()).toBe(values);
  });

  test('uses the name for nesting values and onChange events', () => {
    const testChange = (name, value, onChangeArg, event) => {
      const ffOnChange = jest.fn();
      const wrapper = shallow(
        <ValueSubscriber name={name} />,
        { context: { ...context, ffOnChange } },
      );
      const component = wrapper.instance();
      const childContext = component.getChildContext();
      expect(childContext.ffGetValue()).toBe(value);

      component.onChange(onChangeArg);
      expect(ffOnChange).toHaveBeenCalledTimes(1);
      expect(ffOnChange.mock.calls[0][0].target).toEqual(event);
    };

    testChange('a', values.a, { target: { name: '', value: false } }, { name: ['a'], value: false });
    testChange('a', values.a, false, { name: ['a'], value: false });
    testChange('b', values.b, { test: true }, { name: ['b'], value: { test: true } });
    testChange('c', values.c, ['3', '4'], { name: ['c'], value: ['3', '4'] });
    testChange('c', values.c, { target: { name: '0', value: '5' } }, { name: ['c', '0'], value: '5' });
    testChange('d', values.d, { d1: 'replaced' }, { name: ['d'], value: { d1: 'replaced' } });
    testChange('d', values.d, { target: { name: 'd1', value: 'replaced' } }, { name: ['d', 'd1'], value: 'replaced' });
  });

  test('handles numbers for accessing array values', () => {
    const ffOnChange = jest.fn();
    const wrapper = shallow(<ValueSubscriber name="0" />, {
      context: { ...context, ffOnChange, ffGetValue: () => values.c },
    });
    const component = wrapper.instance();
    expect(component.getValue()).toBe(values.c[0]);

    component.onChange('replaced');
    expect(ffOnChange).toHaveBeenCalledTimes(1);
    expect(ffOnChange.mock.calls[0][0].target).toEqual({ name: ['0'], value: 'replaced' });
  });

  test('only rerenders when the value changes, or props/state change', () => {
    let testValue = values;
    const wrapper = mount(<ValueSubscriber />, {
      context: { ...context, ffGetValue: () => testValue },
    });
    const shouldUpdateSpy = jest.spyOn(wrapper.instance(), 'shouldComponentUpdate');

    expect(shouldUpdateSpy).not.toHaveBeenCalled();

    wrapper.setProps({});
    expect(shouldUpdateSpy).toHaveLastReturnedWith(false);

    wrapper.setState({});
    expect(shouldUpdateSpy).toHaveLastReturnedWith(false);

    wrapper.setProps({ 'data-test': true });
    expect(shouldUpdateSpy).toHaveLastReturnedWith(true);

    wrapper.setState({ test: true });
    expect(shouldUpdateSpy).toHaveLastReturnedWith(true);

    testValue = { ...testValue, a: false };
    wrapper.setState({});
    expect(shouldUpdateSpy).toHaveLastReturnedWith(true);
  });

  test('should throw an invariant when fetching a missing value', () => {
    expect(() => shallow(<ValueSubscriber name="thisKeyIsMissing" />, { context })).toThrowError(
      '"thisKeyIsMissing" must have a value. Please check the handler\'s getDefaults() method.',
    );
  });

  test('nests context.ffFullName()', () => {
    const getFullName = (name, childName, val = values) => shallow(
      <ValueSubscriber name={childName} />,
      { context: { ...context, ffFullName: () => [].concat(name), ffGetValue: () => val } },
    ).instance().getChildContext().ffFullName();

    expect(getFullName('d')).toEqual(['d']);
    expect(getFullName('d', 'd1', { d1: true })).toEqual(['d', 'd1']);
    expect(getFullName('c', '0', [false, true])).toEqual(['c', '0']);
  });

  test('enforces onChange not altering value types', () => {
    const changeType = (oldVal, newVal, name) => shallow(
      <ValueSubscriber />,
      { context: { ...context, ffGetValue: () => oldVal } },
    )
      .instance()
      .onChange({ target: { name, value: newVal } });

    // Same type
    expect(() => changeType(true, false)).not.toThrowError();
    expect(() => changeType(0, 1)).not.toThrowError();
    expect(() => changeType('a', 'b')).not.toThrowError();
    expect(() => changeType([], [])).not.toThrowError();
    expect(() => changeType({}, {})).not.toThrowError();

    // Same type with new type inside
    expect(() => changeType([], ['test'])).not.toThrowError();
    expect(() => changeType({}, { test: 'test' })).not.toThrowError();
    // Same type with no type inside
    expect(() => changeType(['test'], [])).not.toThrowError();
    expect(() => changeType({ test: 'test' }, {})).not.toThrowError();

    expect(() => changeType(true, 'string')).toThrowError();
    expect(() => changeType('0', 0)).toThrowError();
    expect(() => changeType([], {})).toThrowError();
    expect(() => changeType([], true)).toThrowError();
    expect(() => changeType({}, [])).toThrowError();
    expect(() => changeType({}, true)).toThrowError();

    // Same type with different type inside
    expect(() => changeType(['a'], [true])).toThrowError();
    expect(() => changeType({ test: 'a' }, { test: true })).toThrowError();

    // Allow replacing values with null
    expect(() => changeType([], null)).not.toThrowError();
    expect(() => changeType(['test'], [null])).not.toThrowError();
    expect(() => changeType({}, null)).not.toThrowError();
    expect(() => changeType({ test: 'test' }, { test: null })).not.toThrowError();

    // Test name paths
    expect(() => changeType({ test: [] }, 'replace array', 'test')).toThrowError();
    expect(() => changeType({ test: [] }, 'replace array', ['test'])).toThrowError();
    expect(() => changeType({ test: [{}] }, 'replace array', ['test', 0])).toThrowError();

    // Allow strings to change to numbers, if the original was a number
    expect(() => changeType(5, '4')).not.toThrowError();
    expect(() => changeType(5, 'a')).toThrowError();
  });

  test('allow values to be undefined with ignoreUndefined=true', () => {
    expect(() => shallow(<ValueSubscriber name="e" />, { context })).toThrow();
    expect(() => shallow(<ValueSubscriber name="e" ignoreUndefined />, { context })).not.toThrow();
  });
});
