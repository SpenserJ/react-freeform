import React from 'react';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';

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
    const rule = sinon.spy();
    runValidationRules(rule, {}, noop);
    expect(rule.calledOnce).toBe(true);
    expect(rule.calledWith({}, noop)).toBe(true);
  });

  test('should support an array of validation functions', () => {
    const rule1 = sinon.spy();
    const rule2 = sinon.spy();
    runValidationRules([rule1, rule2], {}, noop);
    expect(rule1.calledOnce).toBe(true);
    expect(rule1.calledWith({}, noop)).toBe(true);
    expect(rule2.calledOnce).toBe(true);
    expect(rule2.calledWith({}, noop)).toBe(true);
  });

  test(
    'should support an object of validation functions, nesting the value by key',
    () => {
      const rules = {
        a: sinon.spy(),
        c: sinon.spy((_, invalidate) => invalidate('Test')),
      };
      const invalidateSpy = sinon.spy(noop);

      runValidationRules(rules, values, invalidateSpy);
      expect(rules.a.calledOnce).toBe(true);
      expect(rules.a.args[0][0]).toBe(values.a);

      expect(rules.c.calledOnce).toBe(true);
      expect(rules.c.args[0][0]).toBe(values.c);

      expect(invalidateSpy.calledOnce).toBe(true);
      expect(invalidateSpy.calledWith('Test', ['c'])).toBe(true);
    },
  );

  test('should support arrays and objects nested in objects', () => {
    const rules = {
      c: [
        sinon.spy((_, invalidate) => invalidate('Test')),
        sinon.spy(),
      ],
      d: {
        d1: sinon.spy((_, invalidate) => invalidate('Test')),
      },
    };
    const invalidateSpy = sinon.spy(noop);

    runValidationRules(rules, values, invalidateSpy);
    expect(rules.c[0].calledOnce).toBe(true);
    expect(rules.c[0].args[0][0]).toBe(values.c);
    expect(invalidateSpy.calledWith('Test', ['c'])).toBe(true);

    expect(rules.c[1].calledOnce).toBe(true);
    expect(rules.c[1].args[0][0]).toBe(values.c);

    expect(rules.d.d1.calledOnce).toBe(true);
    expect(rules.d.d1.args[0][0]).toBe(values.d.d1);
    expect(invalidateSpy.calledWith('Test', ['d', 'd1'])).toBe(true);
  });
});

describe('components/Validation', () => {
  test('should run validation when mounting', () => {
    const ffUpdateValidation = sinon.spy();
    const rule = sinon.spy((_, invalidate) => invalidate('test'));
    shallow(<Validation rules={rule} />, { context: { ...context, ffUpdateValidation } });
    expect(rule.calledOnce).toBe(true);
    expect(ffUpdateValidation.calledOnce).toBe(true);
    expect(ffUpdateValidation.calledWith([], [[[], 'test']])).toBe(true);
  });

  test('should run validation after an update has been triggered', () => {
    let triggerUpdate;
    // Only invalidate on the second call
    const rule = sinon.spy((_, invalidate) => (rule.calledTwice ? invalidate('test') : false));
    const componentContext = {
      ...context,
      ffUpdateValidation: sinon.spy(),
      formSubscription: {
        subscribe: (func) => { triggerUpdate = func; },
        unsubscribe: noop,
      },
    };
    shallow(<Validation rules={rule} />, { context: componentContext });
    expect(rule.calledOnce).toBe(true);
    expect(componentContext.ffUpdateValidation.calledOnce).toBe(false);

    triggerUpdate();
    expect(rule.calledTwice).toBe(true);
    expect(componentContext.ffUpdateValidation.calledOnce).toBe(true);
    expect(componentContext.ffUpdateValidation.calledWith([], [[[], 'test']])).toBe(true);
  });

  test('should only send updates if validation results change', () => {
    let triggerUpdate;
    let error = false;
    // Only invalidate on the second call
    const rule = sinon.spy((_, invalidate) => (error ? invalidate(error) : false));
    const componentContext = {
      ...context,
      ffUpdateValidation: sinon.spy(),
      formSubscription: {
        subscribe: (func) => { triggerUpdate = func; },
        unsubscribe: noop,
      },
    };
    // No errors on first render
    shallow(<Validation rules={rule} />, { context: componentContext });
    expect(rule.calledOnce).toBe(true);
    expect(componentContext.ffUpdateValidation.calledOnce).toBe(false);

    // No errors on second render
    triggerUpdate();
    expect(rule.calledTwice).toBe(true);
    expect(componentContext.ffUpdateValidation.calledOnce).toBe(false);

    // Errors on third render
    error = 'Error';
    triggerUpdate();
    expect(rule.calledThrice).toBe(true);
    expect(componentContext.ffUpdateValidation.calledOnce).toBe(true);
    expect(componentContext.ffUpdateValidation.calledWith([], [[[], 'Error']])).toBe(true);
  });

  test('should remove validation when unmounting', () => {
    const rule = sinon.spy((_, invalidate) => invalidate('test'));
    const componentContext = { ...context, ffUpdateValidation: sinon.spy() };
    const wrapper = shallow(<Validation rules={rule} />, { context: componentContext });
    expect(rule.calledOnce).toBe(true);
    expect(componentContext.ffUpdateValidation.calledOnce).toBe(true);
    expect(componentContext.ffUpdateValidation.calledWith([], [[[], 'test']])).toBe(true);

    wrapper.unmount();

    expect(rule.calledTwice).toBe(false);
    expect(componentContext.ffUpdateValidation.calledTwice).toBe(true);
    expect(componentContext.ffUpdateValidation.calledWith([[[], 'test']], [])).toBe(true);
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
