import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';

import handler from '../handler';
import submit from '.';

const defaultValues = { a: true };
class Test extends React.Component { getDefaults() { return defaultValues; } }

describe('HOC/submit', () => {
  it('extends class-based components', () => {
    const TestHandler = submit(handler(Test));
    expect(TestHandler.displayName).toBe('submit(handler(Test))');
    expect(() => { submit(() => {}); }).toThrow('Cannot extend a functional component');
  });

  it("doesn't crash if used before handler", () => {
    const TestHandler = handler(submit(Test));
    expect(() => shallow(<TestHandler />).instance().getChildContext()).not.toThrow();
  });

  it('supports isLoading() and canSubmit()', () => {
    const DefaultHandler = submit(handler(Test));
    const childContext = shallow(<DefaultHandler />).instance().getChildContext();
    expect(childContext.ffCanSubmit()).toBe(true);
    expect(childContext.ffIsLoading()).toBe(false);

    const SubmitHandler = submit(handler(class extends Test {
      canSubmit() { return false; }
    }));
    const childContext2 = shallow(<SubmitHandler />).instance().getChildContext();
    expect(childContext2.ffCanSubmit()).toBe(false);
    expect(childContext2.ffIsLoading()).toBe(false);

    const LoadingHandler = submit(handler(class extends Test {
      isLoading() { return true; }
    }));
    const childContext3 = shallow(<LoadingHandler />).instance().getChildContext();
    expect(childContext3.ffCanSubmit()).toBe(false);
    expect(childContext3.ffIsLoading()).toBe(true);
  });

  it('adds onSubmit to the formProps()', () => {
    const FormPropsHandler = submit(handler(Test));
    const wrapper = shallow(<FormPropsHandler />);
    expect(wrapper.find('form').props().onSubmit).toBe(wrapper.instance().onSubmitBound);
  });

  it('calls the super.onSubmit(values)', () => {
    let callCount = 0;
    class Submit extends Test {
      onSubmit(values) {
        callCount += 1;
        expect(values).toBe(defaultValues);
      }
    }
    const FormSubmit = submit(handler(Submit));
    const wrapper = shallow(<FormSubmit />);
    const preventDefault = jest.fn();
    wrapper.find('form').simulate('submit', { preventDefault });
    expect(callCount).toBe(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('retains childContext', () => {
    const FormContextHandler = submit(handler(class extends Test {
      static childContextTypes = { test: PropTypes.bool.isRequired };

      getChildContext() { return { test: true }; }
    }));
    expect(FormContextHandler.childContextTypes.test).toBe(PropTypes.bool.isRequired);
    const wrapper = shallow(<FormContextHandler />);
    expect(wrapper.instance().getChildContext().test).toBe(true);
  });
});
