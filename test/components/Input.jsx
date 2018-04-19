import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import sinon from 'sinon';

import Input from 'react-freeform/components/Input/';

const noop = () => {};
describe('components/Input', () => {
  it('should render an input with basic props', () => {
    const onChange = sinon.spy((e) => {
      expect(e.target.value).to.equal('changed');
      expect(e.target.name).to.equal('');
    });
    const wrapper = mount(<Input value="test" onChange={onChange} data-name="" />);
    const input = wrapper.find('input');
    expect(input.length).to.equal(1);
    expect(input.instance().value).to.equal('test');
    input.simulate('change', { target: { name: '', value: 'changed' } });
    expect(onChange.calledOnce).to.equal(true);
  });

  it('should pass additional props through', () => {
    const wrapper = mount(<Input value="" onChange={noop} data-name="" data-myprop="exists" />);
    const input = wrapper.find('input');
    expect(input.length).to.equal(1);
    expect(input.props()).to.have.property('data-myprop', 'exists');
  });

  it('should render a checkbox', () => {
    const onChange = sinon.spy((e) => {
      expect(e.target.value).to.equal(false);
      expect(e.target.name).to.equal('');
    });
    const wrapper = mount(<Input value onChange={onChange} data-name="" type="checkbox" />);
    const input = wrapper.find('input');
    expect(input.length).to.equal(1);
    expect(input.instance().value).to.equal('on');
    expect(input.instance().checked).to.equal(true);
    input.simulate('change', { target: { name: '', checked: false } });
    expect(onChange.calledOnce).to.equal(true);
  });

  it('should render a radio', () => {
    const onChange = sinon.spy(value => expect(value).to.equal('b'));
    const wrapper = mount(<Input name="test" value="a" data-value="a" onChange={onChange} data-name="radioName" type="radio" />);
    const input = wrapper.find('input');
    expect(input.length).to.equal(1);
    // Value is 'a', but the checked flag is set if it matches data-value
    expect(input.instance().value).to.equal('a');
    expect(input.instance().checked).to.equal(true);
    // It should use data-name, since that should be fairly unique in the form
    expect(input.props()).to.have.property('name', 'radioName');
    // Emit an event with a name, and the onChange handler should just pass the
    // value on. Name is stripped intentionally
    input.simulate('change', { target: { name: 'radioName', value: 'b' } });
    expect(onChange.calledOnce).to.equal(true);

    // Try rendering a radio that isn't currently selected
    const wrapper2 = mount(<Input name="test" value="a" data-value="b" onChange={noop} data-name="radioName" type="radio" />);
    const input2 = wrapper2.find('input');
    expect(input2.length).to.equal(1);
    // Value is 'a', but the checked flag is set if it matches data-value
    expect(input2.instance().value).to.equal('a');
    expect(input2.instance().checked).to.equal(false);
  });
});
