
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon';

import WithValue from 'react-freeform/components/WithValue';

// Tests for components that this extends or uses
import './ValueSubscriber';

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
  nfGetValue: () => values,
  nfFullName: () => ([]),
  nfOnChange: noop,
  formSubscription: { subscribe: noop, unsubscribe: noop },
};

describe('components/WithValue', () => {
  it('should render the result of the render function', () => {
    const wrapper = shallow(<WithValue>{() => <h1>Test</h1>}</WithValue>, { context });
    expect(wrapper.find('h1').length).to.equal(1);
  });

  it('should pass the value into the render function', () => {
    const render = sinon.spy(() => null);

    shallow(<WithValue>{render}</WithValue>, { context });
    expect(render.args[0][0]).to.deep.equal(values);

    shallow(<WithValue name="c">{render}</WithValue>, { context });
    expect(render.args[1][0]).to.deep.equal(values.c);
  });

  it('should pass a working onChange into the render function', () => {
    const render = sinon.spy(() => null);
    const nfOnChange = sinon.spy();

    shallow(<WithValue>{render}</WithValue>, { context: { ...context, nfOnChange } });
    expect(render.args[0][1]).to.be.an('object');
    expect(render.args[0][1].onChange).to.be.a('function');

    const { onChange } = render.args[0][1];
    onChange({ a: false });
    expect(nfOnChange.calledOnce).to.equal(true);
    expect(nfOnChange.args[0][0].target).to.deep.equal({ name: [], value: { a: false } });
  });
});
