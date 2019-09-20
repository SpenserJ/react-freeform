import React from 'react';
import { mount } from 'enzyme';

import Input from '.';

const noop = () => {};
describe('components/Input', () => {
  test('should render an input with basic props', () => {
    const onChange = jest.fn((e) => {
      expect(e.target.value).toBe('changed');
      expect(e.target.name).toBe('');
    });
    const wrapper = mount(<Input value="test" onChange={onChange} data-name="" />);
    const input = wrapper.find('input');
    expect(input.length).toBe(1);
    expect(input.instance().value).toBe('test');
    input.simulate('change', { target: { name: '', value: 'changed' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test('should pass additional props through', () => {
    const wrapper = mount(<Input value="" onChange={noop} data-name="" data-myprop="exists" />);
    const input = wrapper.find('input');
    expect(input.length).toBe(1);
    expect(input.props()).toHaveProperty('data-myprop', 'exists');
  });

  test('should render a checkbox', () => {
    const onChange = jest.fn((e) => {
      expect(e.target.value).toBe(false);
      expect(e.target.name).toBe('');
    });
    const wrapper = mount(<Input value onChange={onChange} data-name="" type="checkbox" />);
    const input = wrapper.find('input');
    expect(input.length).toBe(1);
    expect(input.instance().value).toBe('on');
    expect(input.instance().checked).toBe(true);
    input.simulate('change', { target: { name: '', checked: false } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test('should render a radio', () => {
    const onChange = jest.fn(value => expect(value).toBe('b'));
    const wrapper = mount(<Input name="test" value="a" data-value="a" onChange={onChange} data-name="radioName" type="radio" />);
    const input = wrapper.find('input');
    expect(input.length).toBe(1);
    // Value is 'a', but the checked flag is set if it matches data-value
    expect(input.instance().value).toBe('a');
    expect(input.instance().checked).toBe(true);
    // It should use data-name, since that should be fairly unique in the form
    expect(input.props()).toHaveProperty('name', 'radioName');
    // Emit an event with a name, and the onChange handler should just pass the
    // value on. Name is stripped intentionally
    input.simulate('change', { target: { name: 'radioName', value: 'b' } });
    expect(onChange).toHaveBeenCalledTimes(1);

    // Try rendering a radio that isn't currently selected
    const wrapper2 = mount(<Input name="test" value="a" data-value="b" onChange={noop} data-name="radioName" type="radio" />);
    const input2 = wrapper2.find('input');
    expect(input2.length).toBe(1);
    // Value is 'a', but the checked flag is set if it matches data-value
    expect(input2.instance().value).toBe('a');
    expect(input2.instance().checked).toBe(false);
  });
});
