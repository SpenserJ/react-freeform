import React from 'react';
import { shallow, mount } from 'enzyme';

import Validation, { runValidationRules } from '.';

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
  ffUpdateValidation: noop,
  ffGetValue: () => values,
  ffFullName: () => ([]),
  formSubscription: { subscribe: noop, unsubscribe: noop },
};

describe('components/runValidationRules', () => {
  test('should support a validation function', () => {
    const rule = jest.fn();
    runValidationRules(rule, {}, noop);
    expect(rule).toHaveBeenCalledTimes(1);
    expect(rule).toHaveBeenLastCalledWith({}, noop);
  });

  test('should support an array of validation functions', () => {
    const rule1 = jest.fn();
    const rule2 = jest.fn();
    runValidationRules([rule1, rule2], {}, noop);
    expect(rule1).toHaveBeenCalledTimes(1);
    expect(rule1).toHaveBeenLastCalledWith({}, noop);
    expect(rule2).toHaveBeenCalledTimes(1);
    expect(rule2).toHaveBeenLastCalledWith({}, noop);
  });

  test(
    'should support an object of validation functions, nesting the value by key',
    () => {
      const rules = {
        a: jest.fn(),
        c: jest.fn((_, invalidate) => invalidate('Test')),
      };
      const invalidateSpy = jest.fn(noop);

      runValidationRules(rules, values, invalidateSpy);
      expect(rules.a).toHaveBeenCalledTimes(1);
      expect(rules.a.mock.calls[0][0]).toBe(values.a);

      expect(rules.c).toHaveBeenCalledTimes(1);
      expect(rules.c.mock.calls[0][0]).toBe(values.c);

      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      expect(invalidateSpy).toHaveBeenLastCalledWith('Test', ['c']);
    },
  );

  test('should support arrays and objects nested in objects', () => {
    const rules = {
      c: [
        jest.fn((_, invalidate) => invalidate('Test')),
        jest.fn(),
      ],
      d: {
        d1: jest.fn((_, invalidate) => invalidate('Test')),
      },
    };
    const invalidateSpy = jest.fn(noop);

    runValidationRules(rules, values, invalidateSpy);
    expect(rules.c[0]).toHaveBeenCalledTimes(1);
    expect(rules.c[0].mock.calls[0][0]).toBe(values.c);
    expect(invalidateSpy).toHaveBeenCalledWith('Test', ['c']);

    expect(rules.c[1]).toHaveBeenCalledTimes(1);
    expect(rules.c[1].mock.calls[0][0]).toBe(values.c);

    expect(rules.d.d1).toHaveBeenCalledTimes(1);
    expect(rules.d.d1.mock.calls[0][0]).toBe(values.d.d1);
    expect(invalidateSpy).toHaveBeenCalledWith('Test', ['d', 'd1']);
  });
});

describe('components/Validation', () => {
  test('should run validation when mounting', () => {
    const ffUpdateValidation = jest.fn();
    const rule = jest.fn((_, invalidate) => invalidate('test'));
    shallow(<Validation rules={rule} />, { context: { ...context, ffUpdateValidation } });
    expect(rule).toHaveBeenCalledTimes(1);
    expect(ffUpdateValidation).toHaveBeenCalledTimes(1);
    expect(ffUpdateValidation).toHaveBeenLastCalledWith([], [[[], 'test']]);
  });

  test('should run validation after an update has been triggered', () => {
    let triggerUpdate;
    // Only invalidate on the second call
    const rule = jest.fn((_, invalidate) => (rule.mock.calls.length === 2
      ? invalidate('test')
      : false
    ));
    const componentContext = {
      ...context,
      ffUpdateValidation: jest.fn(),
      formSubscription: {
        subscribe: (func) => { triggerUpdate = func; },
        unsubscribe: noop,
      },
    };
    shallow(<Validation rules={rule} />, { context: componentContext });
    expect(rule).toHaveBeenCalledTimes(1);
    expect(componentContext.ffUpdateValidation).not.toHaveBeenCalled();

    triggerUpdate();
    expect(rule).toHaveBeenCalledTimes(2);
    expect(componentContext.ffUpdateValidation).toHaveBeenCalledTimes(1);
    expect(componentContext.ffUpdateValidation).toHaveBeenLastCalledWith([], [[[], 'test']]);
  });

  test('should only send updates if validation results change', () => {
    let triggerUpdate;
    let error = false;
    // Only invalidate on the second call
    const rule = jest.fn((_, invalidate) => (error ? invalidate(error) : false));
    const componentContext = {
      ...context,
      ffUpdateValidation: jest.fn(),
      formSubscription: {
        subscribe: (func) => { triggerUpdate = func; },
        unsubscribe: noop,
      },
    };
    // No errors on first render
    shallow(<Validation rules={rule} />, { context: componentContext });
    expect(rule).toHaveBeenCalledTimes(1);
    expect(componentContext.ffUpdateValidation).not.toHaveBeenCalled();

    // No errors on second render
    triggerUpdate();
    expect(rule).toHaveBeenCalledTimes(2);
    expect(componentContext.ffUpdateValidation).not.toHaveBeenCalled();

    // Errors on third render
    error = 'Error';
    triggerUpdate();
    expect(rule).toHaveBeenCalledTimes(3);
    expect(componentContext.ffUpdateValidation).toHaveBeenCalledTimes(1);
    expect(componentContext.ffUpdateValidation).toHaveBeenLastCalledWith([], [[[], 'Error']]);
  });

  test('should remove validation when unmounting', () => {
    const rule = jest.fn((_, invalidate) => invalidate('test'));
    const componentContext = { ...context, ffUpdateValidation: jest.fn() };
    const wrapper = shallow(<Validation rules={rule} />, { context: componentContext });
    expect(rule).toHaveBeenCalledTimes(1);
    expect(componentContext.ffUpdateValidation).toHaveBeenCalledTimes(1);
    expect(componentContext.ffUpdateValidation).toHaveBeenLastCalledWith([], [[[], 'test']]);

    wrapper.unmount();

    expect(rule).not.toHaveBeenCalledTimes(2);
    expect(componentContext.ffUpdateValidation).toHaveBeenCalledTimes(2);
    expect(componentContext.ffUpdateValidation).toHaveBeenLastCalledWith([[[], 'test']], []);
  });

  test('should render a list of errors', () => {
    let triggerUpdate;
    const componentContext = {
      ...context,
      formSubscription: {
        subscribe: (func) => { triggerUpdate = func; },
        unsubscribe: noop,
      },
    };

    const makeRule = error => (_, invalidate) => invalidate(error);
    let rules = makeRule('test');
    const wrapper = mount(<Validation rules={rules} />, { context: componentContext });
    expect(wrapper.find('li').length).toBe(1);

    rules = makeRule('change message');
    wrapper.setProps({ rules });
    // TODO: Triggering the update and render here instead of from the
    // ffUpdateValidation context, and it needs to be cleaned up
    triggerUpdate();
    wrapper.update();
    expect(wrapper.find('li').length).toBe(1);
    expect(wrapper.find('li').text()).toBe('change message');

    // Set the rules to two rules
    rules = [rules, makeRule('error')];
    wrapper.setProps({ rules });
    // TODO: Triggering the update and render here instead of from the
    // ffUpdateValidation context, and it needs to be cleaned up
    triggerUpdate();
    wrapper.update();
    expect(wrapper.find('li').length).toBe(2);
  });

  test('should support displaying errors before or after children', () => {
    const rules = (_, invalidate) => invalidate('Error');
    expect(shallow(<Validation rules={rules}>Child</Validation>, { context }).text()).toBe('ChildError');

    expect(shallow(<Validation rules={rules} displayBeforeChildren>Child</Validation>, { context }).text()).toBe('ErrorChild');
  });
});
