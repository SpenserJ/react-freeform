import React from 'react';
import { expect } from 'chai';
import { shallow, mount, render } from 'enzyme';

import handler from 'react-neoform/HOC/handler';

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
    expect(TestHandler.displayName).to.equal('handler(Test)');
  });

  it('sets default values', () => {
    const DefaultHandler = handler(TestWithDefaults);
    const wrapper = shallow(<DefaultHandler />);
    expect(wrapper.state().values).to.equal(defaultValues);
  });

  it('creates a form tag automatically', () => {
    const FormHandler = handler(Test);
    const wrapper = shallow(<FormHandler />);
    expect(wrapper.type()).to.equal('form');
  });
});
