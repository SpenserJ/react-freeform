import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon';

import handler from 'react-freeform/HOC/handler';
import submit from 'react-freeform/HOC/submit';

const defaultValues = { a: true };
class Test extends React.Component { getDefaults() { return defaultValues; } }

describe('HOC/submit', () => {
  it('extends class-based components', () => {
    const TestHandler = submit(handler(Test));
    expect(TestHandler.displayName).to.equal('submit(handler(Test))');
  });

  it('sets isLoading and canSubmit to sane defaults', () => {
    const DefaultHandler = submit(handler(Test));
    const childContext = shallow(<DefaultHandler />).instance().getChildContext();
    expect(childContext.nfCanSubmit()).to.equal(true);
    expect(childContext.nfIsLoading()).to.equal(false);

    const LoadingHandler = submit(handler(class extends Test {
      isLoading() { return true; }
    }));
    const childContext2 = shallow(<LoadingHandler />).instance().getChildContext();
    expect(childContext2.nfCanSubmit()).to.equal(false);
    expect(childContext2.nfIsLoading()).to.equal(true);
  });

  it('adds onSubmit to the formProps()', () => {
    const FormPropsHandler = submit(handler(Test));
    const wrapper = shallow(<FormPropsHandler />);
    expect(wrapper.find('form').props().onSubmit).to.equal(wrapper.instance().onSubmitBound);
  });

  it('calls the super.onSubmit(values)', () => {
    let callCount = 0;
    class Submit extends Test {
      onSubmit(values) {
        callCount += 1;
        expect(values).to.equal(defaultValues);
      }
    }
    const FormSubmit = submit(handler(Submit));
    const wrapper = shallow(<FormSubmit />);
    const preventDefault = sinon.spy();
    wrapper.find('form').simulate('submit', { preventDefault });
    expect(callCount).to.equal(1);
    expect(preventDefault.calledOnce).to.equal(true);
  });
});
