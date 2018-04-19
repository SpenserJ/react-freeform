import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon';

import handler from 'react-freeform/HOC/handler';

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

class TestWithFormProps extends Test {
  formProps() { return { 'data-myProp': true }; }
}

describe('HOC/handler', () => {
  it('extends class-based components', () => {
    const TestHandler = handler(Test);
    expect(TestHandler.displayName).to.equal('handler(Test)');
    expect(() => { handler(() => {}); }).to.throw('Cannot extend a functional component');
  });

  it('updates the state when receiving an onChange', () => {
    const DefaultHandler = handler(TestWithDefaults);
    const wrapper = shallow(<DefaultHandler />);
    const instance = wrapper.instance();

    let expectedVal = defaultValues;
    expect(wrapper.state().values).to.deep.equal(defaultValues);
    expect(instance.getChildContext().ffGetValue()).to.deep.equal(defaultValues);

    expectedVal = { ...expectedVal, a: false };
    instance.onChange(({ target: { name: 'a', value: false } }));
    expect(wrapper.state().values).to.deep.equal(expectedVal);
    expect(instance.getChildContext().ffGetValue()).to.deep.equal(expectedVal);

    instance.onChange(({ target: { name: ['d', 'd1'], value: 'updated' } }));
    expectedVal = { ...expectedVal, d: { d1: 'updated' } };
    expect(wrapper.state().values).to.deep.equal(expectedVal);
    expect(instance.getChildContext().ffGetValue()).to.deep.equal(expectedVal);
  });

  it('creates a form tag automatically', () => {
    const FormHandler = handler(Test);
    const wrapper = shallow(<FormHandler />);
    expect(wrapper.type()).to.equal('form');
  });

  it('adds formProps() to the form', () => {
    const FormPropsHandler = handler(class extends Test {
      formProps() { return { 'data-myProp': true }; }
    });
    const wrapper = shallow(<FormPropsHandler />);
    expect(wrapper.type()).to.equal('form');
    expect(wrapper.find('form').props()['data-myProp']).to.equal(true);
  });

  it('retains childContext', () => {
    const FormContextHandler = handler(class extends Test {
      static childContextTypes = { test: PropTypes.bool.isRequired };
      getChildContext() { return { test: true }; }
    });
    expect(FormContextHandler.childContextTypes.test).to.equal(PropTypes.bool.isRequired);
    const wrapper = shallow(<FormContextHandler />);
    expect(wrapper.instance().getChildContext().test).to.equal(true);
  });

  it('supports wrapped render', () => {
    const FormRenderHandler = handler(class extends Test {
      render() { return <pre>{this.props.children}</pre>; }
    });
    const wrapper = shallow(<FormRenderHandler />);
    expect(wrapper.find('pre').exists()).to.equal(true);
  });

  it('tracks form subscriptions', () => {
    const TestHandler = handler(Test);
    const instance = shallow(<TestHandler />).instance();
    const context = instance.getChildContext();
    const updateCallback = sinon.spy();
    context.formSubscription.subscribe(updateCallback);
    expect(updateCallback.called).to.equal(false);
    instance.triggerUpdate();
    expect(updateCallback.calledOnce).to.equal(true);
    context.formSubscription.unsubscribe(updateCallback);
    instance.triggerUpdate();
    expect(updateCallback.calledOnce).to.equal(true);
  });

  it('sets default name', () => {
    const DefaultHandler = handler(TestWithDefaults);
    const context = shallow(<DefaultHandler />).instance().getChildContext();
    expect(context.ffFullName()).to.deep.equal([]);
  });
});
