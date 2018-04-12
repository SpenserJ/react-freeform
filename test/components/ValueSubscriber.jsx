import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';

import handler from 'react-freeform/HOC/handler';
import ValueSubscriber from 'react-freeform/components/ValueSubscriber';

// Tests that this should run after
import '../components/Subscriber'
import '../HOC/handler'

const defaultValues = {
  a: true,
  b: null,
  c: 15.5,
  d: {
    d1: 'nested',
  },
};

const Handler = handler(class Test extends React.Component {
  getDefaults() { return defaultValues; }
});

describe('components/ValueSubscriber', () => {
  it('provides access to the form values without a name', () => {
    const wrapper = mount(<Handler><ValueSubscriber /></Handler>);
    const component = wrapper.find('ValueSubscriber').instance();
    expect(component.getValue()).to.equal(defaultValues);
  });

  it('provides access to the form values with a name', () => {
    const wrapper = mount(<Handler><ValueSubscriber name="d" /></Handler>);
    const component = wrapper.find('ValueSubscriber').instance();
    expect(component.getValue()).to.equal(defaultValues.d);
  });

  it('handles onChange events without a name', () => {
    const wrapper = mount(<Handler><ValueSubscriber /></Handler>);
    const component = wrapper.find('ValueSubscriber').instance();
    component.onChange({ target: { name: undefined, value: 'test' } });
    expect(component.getValue()).to.equal('test');
  });

  it('handles onChange events with a name', () => {
    const wrapper = mount(<Handler><ValueSubscriber name="d" /></Handler>);
    const component = wrapper.find('ValueSubscriber').instance();
    const newVal = { a: true, b: false };
    component.onChange({ target: { name: undefined, value: newVal } });
    expect(component.getValue()).to.equal(newVal);
  });

  it('handles nested onChange events', () => {
    const wrapper = mount(<Handler><ValueSubscriber /></Handler>);
    const component = wrapper.find('ValueSubscriber').instance();
    const newVal = { a: true, b: false };
    component.onChange({ target: { name: 'd', value: newVal } });
    expect(component.getValue().d).to.equal(newVal);
  });
});
