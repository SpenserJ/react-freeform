import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon';

import handler from 'react-freeform/HOC/handler';
import submit from 'react-freeform/HOC/submit';

// Tests for components that this extends or uses
import './handler';

const defaultValues = { a: true };
class Test extends React.Component { getDefaults() { return defaultValues; } }

describe('HOC/submit', () => {
  it('extends class-based components', () => {
    const TestHandler = submit(handler(Test));
    expect(TestHandler.displayName).to.equal('submit(handler(Test))');
    expect(() => { submit(() => {}); }).to.throw('Cannot extend a functional component');
  });

  it("doesn't crash if used before handler", () => {
    const TestHandler = handler(submit(Test));
    expect(() => shallow(<TestHandler />).instance().getChildContext()).to.not.throw();
  });

  it('supports isLoading() and canSubmit()', () => {
    const DefaultHandler = submit(handler(Test));
    const childContext = shallow(<DefaultHandler />).instance().getChildContext();
    expect(childContext.ffCanSubmit()).to.equal(true);
    expect(childContext.ffIsLoading()).to.equal(false);

    const SubmitHandler = submit(handler(class extends Test {
      canSubmit() { return false; }
    }));
    const childContext2 = shallow(<SubmitHandler />).instance().getChildContext();
    expect(childContext2.ffCanSubmit()).to.equal(false);
    expect(childContext2.ffIsLoading()).to.equal(false);

    const LoadingHandler = submit(handler(class extends Test {
      isLoading() { return true; }
    }));
    const childContext3 = shallow(<LoadingHandler />).instance().getChildContext();
    expect(childContext3.ffCanSubmit()).to.equal(false);
    expect(childContext3.ffIsLoading()).to.equal(true);
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

  it('retains childContext', () => {
    const FormContextHandler = submit(handler(class extends Test {
      static childContextTypes = { test: PropTypes.bool.isRequired };
      getChildContext() { return { test: true }; }
    }));
    expect(FormContextHandler.childContextTypes.test).to.equal(PropTypes.bool.isRequired);
    const wrapper = shallow(<FormContextHandler />);
    expect(wrapper.instance().getChildContext().test).to.equal(true);
  });
});
