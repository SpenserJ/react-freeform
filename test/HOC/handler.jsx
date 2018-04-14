import React from 'react';
import { expect } from 'chai';
import { shallow, mount, render } from 'enzyme';

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
  });

  it('sets default values', () => {
    const DefaultHandler = handler(TestWithDefaults);
    const wrapper = shallow(<DefaultHandler />);
    expect(wrapper.state().values).to.equal(defaultValues);
    expect(wrapper.instance().getChildContext().nfGetValue()).to.equal(defaultValues);
  });

  it('creates a form tag automatically', () => {
    const FormHandler = handler(Test);
    const wrapper = shallow(<FormHandler />);
    expect(wrapper.type()).to.equal('form');
  });

  it('adds formProps() to the form', () => {
    const FormPropsHandler = handler(TestWithFormProps);
    const wrapper = shallow(<FormPropsHandler />);
    expect(wrapper.type()).to.equal('form');
    expect(wrapper.find('form').props()['data-myProp']).to.equal(true);
  });
});
