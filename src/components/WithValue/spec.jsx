import React from 'react';
import { shallow } from 'enzyme';

import WithValue from '.';

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
  ffOnChange: noop,
  formSubscription: { subscribe: noop, unsubscribe: noop },
};

describe('components/WithValue', () => {
  test('should render the result of the render function', () => {
    const wrapper = shallow(<WithValue>{() => <h1>Test</h1>}</WithValue>, { context });
    expect(wrapper.find('h1').length).toBe(1);
  });

  test('should pass the value into the render function', () => {
    const render = jest.fn(() => null);

    shallow(<WithValue>{render}</WithValue>, { context });
    expect(render.mock.calls[0][0]).toEqual(values);

    shallow(<WithValue name="c">{render}</WithValue>, { context });
    expect(render.mock.calls[1][0]).toEqual(values.c);
  });

  test('should pass a working onChange into the render function', () => {
    const render = jest.fn(() => null);
    const ffOnChange = jest.fn();

    shallow(<WithValue>{render}</WithValue>, { context: { ...context, ffOnChange } });
    expect(typeof render.mock.calls[0][1]).toBe('object');
    expect(typeof render.mock.calls[0][1].onChange).toBe('function');

    const { onChange } = render.mock.calls[0][1];
    onChange({ a: false });
    expect(ffOnChange).toHaveBeenCalledTimes(1);
    expect(ffOnChange.mock.calls[0][0].target).toEqual({ name: [], value: { a: false } });
  });
});
