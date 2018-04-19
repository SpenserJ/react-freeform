import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';

import Validation, { runValidationRules } from 'react-freeform/components/Validation';

// Tests for components that this extends or uses
import './ValueSubscriber';

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
  it('should support a validation function', () => {
    const rule = sinon.spy();
    runValidationRules(rule, {}, noop);
    expect(rule.calledOnce).to.equal(true);
    expect(rule.calledWith({}, noop)).to.equal(true);
  });

  it('should support an array of validation functions', () => {
    const rule1 = sinon.spy();
    const rule2 = sinon.spy();
    runValidationRules([rule1, rule2], {}, noop);
    expect(rule1.calledOnce).to.equal(true);
    expect(rule1.calledWith({}, noop)).to.equal(true);
    expect(rule2.calledOnce).to.equal(true);
    expect(rule2.calledWith({}, noop)).to.equal(true);
  });

  it('should support an object of validation functions, nesting the value by key', () => {
    const rules = {
      a: sinon.spy(),
      c: sinon.spy((_, invalidate) => invalidate('Test')),
    };
    const invalidateSpy = sinon.spy(noop);

    runValidationRules(rules, values, invalidateSpy);
    expect(rules.a.calledOnce).to.equal(true);
    expect(rules.a.args[0][0]).to.equal(values.a);

    expect(rules.c.calledOnce).to.equal(true);
    expect(rules.c.args[0][0]).to.equal(values.c);

    expect(invalidateSpy.calledOnce).to.equal(true);
    expect(invalidateSpy.calledWith('Test', ['c'])).to.equal(true);
  });

  it('should support arrays and objects nested in objects', () => {
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
    expect(rules.c[0].calledOnce).to.equal(true);
    expect(rules.c[0].args[0][0]).to.equal(values.c);
    expect(invalidateSpy.calledWith('Test', ['c'])).to.equal(true);

    expect(rules.c[1].calledOnce).to.equal(true);
    expect(rules.c[1].args[0][0]).to.equal(values.c);

    expect(rules.d.d1.calledOnce).to.equal(true);
    expect(rules.d.d1.args[0][0]).to.equal(values.d.d1);
    expect(invalidateSpy.calledWith('Test', ['d', 'd1'])).to.equal(true);
  });
});

describe('components/Validation', () => {
  it('should run validation when mounting', () => {
    const ffUpdateValidation = sinon.spy();
    const rule = sinon.spy((_, invalidate) => invalidate('test'));
    shallow(<Validation rules={rule} />, { context: { ...context, ffUpdateValidation } });
    expect(rule.calledOnce).to.equal(true);
    expect(ffUpdateValidation.calledOnce).to.equal(true);
    expect(ffUpdateValidation.calledWith([], [[[], 'test']])).to.equal(true);
  });

  it('should run validation after an update has been triggered', () => {
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
    expect(rule.calledOnce).to.equal(true);
    expect(componentContext.ffUpdateValidation.calledOnce).to.equal(false);

    triggerUpdate();
    expect(rule.calledTwice).to.equal(true);
    expect(componentContext.ffUpdateValidation.calledOnce).to.equal(true);
    expect(componentContext.ffUpdateValidation.calledWith([], [[[], 'test']])).to.equal(true);
  });

  it('should only send updates if validation results change', () => {
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
    expect(rule.calledOnce).to.equal(true);
    expect(componentContext.ffUpdateValidation.calledOnce).to.equal(false);

    // No errors on second render
    triggerUpdate();
    expect(rule.calledTwice).to.equal(true);
    expect(componentContext.ffUpdateValidation.calledOnce).to.equal(false);

    // Errors on third render
    error = 'Error';
    triggerUpdate();
    expect(rule.calledThrice).to.equal(true);
    expect(componentContext.ffUpdateValidation.calledOnce).to.equal(true);
    expect(componentContext.ffUpdateValidation.calledWith([], [[[], 'Error']])).to.equal(true);
  });

  it('should remove validation when unmounting', () => {
    const rule = sinon.spy((_, invalidate) => invalidate('test'));
    const componentContext = { ...context, ffUpdateValidation: sinon.spy() };
    const wrapper = shallow(<Validation rules={rule} />, { context: componentContext });
    expect(rule.calledOnce).to.equal(true);
    expect(componentContext.ffUpdateValidation.calledOnce).to.equal(true);
    expect(componentContext.ffUpdateValidation.calledWith([], [[[], 'test']])).to.equal(true);

    wrapper.unmount();

    expect(rule.calledTwice).to.equal(false);
    expect(componentContext.ffUpdateValidation.calledTwice).to.equal(true);
    expect(componentContext.ffUpdateValidation.calledWith([[[], 'test']], []))
      .to.equal(true, 'Validation was not cleared before unmount');
  });

  it('should render a list of errors', () => {
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
    expect(wrapper.find('li').length).to.equal(1);

    rules = makeRule('change message');
    wrapper.setProps({ rules });
    // TODO: Triggering the update and render here instead of from the
    // ffUpdateValidation context, and it needs to be cleaned up
    triggerUpdate();
    wrapper.update();
    expect(wrapper.find('li').length).to.equal(1);
    expect(wrapper.find('li').text()).to.equal('change message');

    // Set the rules to two rules
    rules = [rules, makeRule('error')];
    wrapper.setProps({ rules });
    // TODO: Triggering the update and render here instead of from the
    // ffUpdateValidation context, and it needs to be cleaned up
    triggerUpdate();
    wrapper.update();
    expect(wrapper.find('li').length).to.equal(2);
  });

  it('should support displaying errors before or after children', () => {
    const rules = (_, invalidate) => invalidate('Error');
    expect(shallow(<Validation rules={rules}>Child</Validation>, { context }).text())
      .to.equal('ChildError');

    expect(shallow(<Validation rules={rules} displayBeforeChildren>Child</Validation>, { context }).text())
      .to.equal('ErrorChild');
  });
});
