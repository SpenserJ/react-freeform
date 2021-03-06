import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';

import handler from '.';

// eslint-disable-next-line react/prefer-stateless-function
class Test extends React.Component {}

const defaultValues = {
  a: true,
  b: null,
  c: 15.5,
  d: {
    d1: 'nested',
  },
};

class TestWithDefaults extends Test {
  getDefaults() { return defaultValues; }
}

describe('HOC/handler', () => {
  it('extends class-based components', () => {
    const TestHandler = handler(Test);
    expect(TestHandler.displayName).toBe('handler(Test)');
    expect(() => { handler(() => {}); }).toThrow('Cannot extend a functional component');
  });

  it('updates the state when receiving an onChange', () => {
    const DefaultHandler = handler(TestWithDefaults);
    const wrapper = shallow(<DefaultHandler />);
    const instance = wrapper.instance();

    let expectedVal = defaultValues;
    expect(wrapper.state().values).toEqual(defaultValues);
    expect(instance.getChildContext().ffGetValue()).toEqual(defaultValues);

    expectedVal = { ...expectedVal, a: false };
    instance.onChange(({ target: { name: 'a', value: false } }));
    expect(wrapper.state().values).toEqual(expectedVal);
    expect(instance.getChildContext().ffGetValue()).toEqual(expectedVal);

    instance.onChange(({ target: { name: ['d', 'd1'], value: 'updated' } }));
    expectedVal = { ...expectedVal, d: { d1: 'updated' } };
    expect(wrapper.state().values).toEqual(expectedVal);
    expect(instance.getChildContext().ffGetValue()).toEqual(expectedVal);
  });

  it('creates a form tag automatically', () => {
    const FormHandler = handler(Test);
    const wrapper = shallow(<FormHandler />);
    expect(wrapper.type()).toBe('form');
  });

  it('adds formProps() to the form', () => {
    const FormPropsHandler = handler(class extends Test {
      formProps() { return { 'data-myProp': true }; }
    });
    const wrapper = shallow(<FormPropsHandler />);
    expect(wrapper.type()).toBe('form');
    expect(wrapper.find('form').props()['data-myProp']).toBe(true);
  });

  it('retains childContext', () => {
    const FormContextHandler = handler(class extends Test {
      static childContextTypes = { test: PropTypes.bool.isRequired };

      getChildContext() { return { test: true }; }
    });
    expect(FormContextHandler.childContextTypes.test).toBe(PropTypes.bool.isRequired);
    const wrapper = shallow(<FormContextHandler />);
    expect(wrapper.instance().getChildContext().test).toBe(true);
  });

  it('supports wrapped render', () => {
    const FormRenderHandler = handler(class extends Test {
      render() { return <pre>{this.props.children}</pre>; }
    });
    const wrapper = shallow(<FormRenderHandler />);
    expect(wrapper.find('pre').exists()).toBe(true);
  });

  it('tracks form subscriptions', () => {
    const TestHandler = handler(Test);
    const instance = shallow(<TestHandler />).instance();
    const context = instance.getChildContext();
    const updateCallback = jest.fn();
    context.formSubscription.subscribe(updateCallback);
    expect(updateCallback).not.toHaveBeenCalled();
    instance.triggerUpdate();
    expect(updateCallback).toHaveBeenCalledTimes(1);
    context.formSubscription.unsubscribe(updateCallback);
    instance.triggerUpdate();
    expect(updateCallback).toHaveBeenCalledTimes(1);
  });

  it('sets default name', () => {
    const DefaultHandler = handler(TestWithDefaults);
    const context = shallow(<DefaultHandler />).instance().getChildContext();
    expect(context.ffFullName()).toEqual([]);
  });
});
