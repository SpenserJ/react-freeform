import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';

import Field from 'react-freeform/components/Field';

// Tests for components that this extends or uses
import './Input';

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
  ffGetValue: () => values,
  ffFullName: () => ([]),
  ffFormIndex: 1,
  ffOnChange: noop,
  formSubscription: { subscribe: noop, unsubscribe: noop },
};

describe('components/Field', () => {
  it('should filter out internal props from the passthrough props', () => {
    const wrapper = shallow(<Field name="a" component="input" onChange={noop} a="1" />, { context });
    expect(wrapper.instance().getOtherProps()).to.deep.equal({ a: '1', children: null });
  });

  it('should support overriding the input component', () => {
    expect(mount(<Field />, { context }).find('input').length).to.equal(1);

    const TestInput = () => <h1>Test</h1>;
    const wrapper = shallow(<Field component={TestInput} />, { context });
    expect(wrapper.find('input').length).to.equal(0);
    expect(wrapper.find(TestInput).length).to.equal(1);
  });

  it('should pass data-value with the true value, if it receives value as a prop', () => {
    const wrapper = mount(<Field value="test" name="a" />, { context });
    const input = wrapper.find('input');
    expect(input.props()).to.have.property('value', 'test');
    expect(input.props()).to.have.property('data-value', true);
  });

  it('should pass data-name as a string of the entire form path', () => {
    expect(mount(<Field value="test" name="a" />, { context }).find('input').props())
      .to.have.property('data-name', 'a');
    expect(mount(
      <Field value="test" name="d1" />,
      { context: { ...context, ffFullName: () => (['d']), ffGetValue: () => ({ d1: 'test' }) } },
    ).find('input').props()).to.have.property('data-name', 'd.d1');
  });

  it('should pass id as a string of the entire form path with a form identifier', () => {
    expect(mount(<Field value="test" name="a" />, { context }).find('input').props())
      .to.have.property('id', '1.a');
    expect(mount(
      <Field value="test" name="d1" />,
      { context: { ...context, ffFullName: () => (['d']), ffGetValue: () => ({ d1: 'test' }) } },
    ).find('input').props()).to.have.property('id', '1.d.d1');
  });

  it('should pass a working onChange into the input', () => {
    const ffOnChange = sinon.spy();
    const input = mount(<Field name="a" />, { context: { ...context, ffOnChange } }).find('input');
    input.simulate('change', { target: { name: '', value: false } });
    expect(ffOnChange.calledOnce).to.equal(true);
    expect(ffOnChange.args[0][0].target).to.deep.equal({ name: ['a'], value: false });
  });
});
