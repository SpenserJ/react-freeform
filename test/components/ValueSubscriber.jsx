import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';

import ValueSubscriber from 'react-freeform/components/ValueSubscriber';

// Tests for components that this extends or uses
import './Subscriber';

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
  nfOnChange: noop,
  nfGetValue: () => values,
  nfFullName: () => ([]),
  formSubscription: { subscribe: noop, unsubscribe: noop },
};

describe('components/ValueSubscriber', () => {
  it('provides access to the form values without a name', () => {
    const wrapper = shallow(<ValueSubscriber />, { context });
    const component = wrapper.instance();
    expect(component.getChildContext().nfGetValue()).to.equal(values);
  });

  it('uses the name for nesting values and onChange events', () => {
    const nfOnChange = sinon.spy();
    const wrapper = shallow(<ValueSubscriber name="d" />, { context: { ...context, nfOnChange } });
    const component = wrapper.instance();
    const childContext = component.getChildContext();
    expect(childContext.nfGetValue()).to.equal(values.d);

    component.onChange({ target: { name: '', value: 'replaced' } });
    expect(nfOnChange.calledOnce).to.equal(true);
    expect(nfOnChange.args[0][0].target).to.deep.equal({ name: ['d'], value: 'replaced' });

    component.onChange({ target: { name: 'd1', value: 'replaced' } });
    expect(nfOnChange.calledTwice).to.equal(true);
    expect(nfOnChange.args[1][0].target).to.deep.equal({ name: ['d', 'd1'], value: 'replaced' });

    // Test only passing a value, instead of a regular event
    component.onChange({ d1: 'replaced' });
    expect(nfOnChange.calledThrice).to.equal(true);
    expect(nfOnChange.args[2][0].target).to.deep.equal({ name: ['d'], value: { d1: 'replaced' } });
  });

  it('handles numbers for accessing array values', () => {
    const nfOnChange = sinon.spy();
    const wrapper = shallow(<ValueSubscriber name="0" />, {
      context: { ...context, nfOnChange, nfGetValue: () => values.c },
    });
    const component = wrapper.instance();
    expect(component.getValue()).to.equal(values.c[0]);

    component.onChange('replaced');
    expect(nfOnChange.calledOnce).to.equal(true);
    expect(nfOnChange.args[0][0].target).to.deep.equal({ name: ['0'], value: 'replaced' });
  });

  it('only rerenders when the value changes, or props/state change', () => {
    let testValue = values;
    const wrapper = mount(<ValueSubscriber />, {
      context: { ...context, nfGetValue: () => testValue },
    });
    const shouldUpdateSpy = sinon.spy(wrapper.instance(), 'shouldComponentUpdate');

    expect(shouldUpdateSpy.called).to.equal(false);

    wrapper.setProps({});
    expect(shouldUpdateSpy.returnValues[0]).to.equal(false);

    wrapper.setState({});
    expect(shouldUpdateSpy.returnValues[1]).to.equal(false);

    wrapper.setProps({ 'data-test': true });
    expect(shouldUpdateSpy.returnValues[2]).to.equal(true);

    wrapper.setState({ test: true });
    expect(shouldUpdateSpy.returnValues[3]).to.equal(true);

    testValue = { ...testValue, a: false };
    wrapper.setState({});
    expect(shouldUpdateSpy.returnValues[4]).to.equal(true);

    shouldUpdateSpy.restore();
  });

  it('should throw an invariant when fetching a missing value', () => {
    expect(() => shallow(<ValueSubscriber name="thisKeyIsMissing" />, { context }))
      .to.throw('"thisKeyIsMissing" must have a value. Please check the handler\'s getDefaults() method.');
  });

  it('nests context.nfFullName()', () => {
    const getFullName = (name, childName, val = values) => shallow(
      <ValueSubscriber name={childName} />,
      { context: { ...context, nfFullName: () => [].concat(name), nfGetValue: () => val } },
    ).instance().getChildContext().nfFullName();

    expect(getFullName('d')).to.deep.equal(['d']);
    expect(getFullName('d', 'd1', { d1: true })).to.deep.equal(['d', 'd1']);
    expect(getFullName('c', '0', [false, true])).to.deep.equal(['c', '0']);
  });

  it('enforces onChange not altering value types');
});
