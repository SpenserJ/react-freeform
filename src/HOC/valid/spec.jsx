import React from 'react';
import { shallow } from 'enzyme';

import handler from '../handler';
import valid from '.';

class Test extends React.Component { getDefaults() { return { a: true }; } }

describe('HOC/valid', () => {
  it('extends class-based components', () => {
    const TestHandler = valid(handler(Test));
    expect(TestHandler.displayName).toBe('valid(handler(Test))');
    expect(() => { valid(() => {}); }).toThrow('Cannot extend a functional component');
  });

  it("doesn't crash if used before handler", () => {
    const TestHandler = handler(valid(Test));
    expect(() => shallow(<TestHandler />).instance().getChildContext()).not.toThrow();
  });

  it('yields to super.canSubmit()', () => {
    const TestHandler = valid(handler(class extends Test { canSubmit() { return false; } }));
    const component = shallow(<TestHandler />).instance();
    expect(component.canSubmit()).toBe(false);
  });

  it('can submit with no validation errors', () => {
    const TestHandler = valid(handler(Test));
    const component = shallow(<TestHandler />).instance();
    expect(component.canSubmit()).toBe(true);
  });

  it('adds and removes validation arrays when called, and blocks sumbit accordingly', () => {
    const TestHandler = valid(handler(Test));
    const component = shallow(<TestHandler />).instance();
    const { ffUpdateValidation } = component.getChildContext();

    expect(component.state.validationResults.length).toBe(0);

    // Handles initial mount
    ffUpdateValidation(undefined, []);
    expect(component.state.validationResults.length).toBe(0);

    ffUpdateValidation([], []);
    expect(component.state.validationResults.length).toBe(0);

    const validationResult = ['Error'];
    ffUpdateValidation([], validationResult);
    expect(component.state.validationResults.length).toBe(1);
    // Shouldn't be able to submit the form with validation errors
    expect(component.canSubmit()).toBe(false);

    // Test other components triggering their own validation
    ffUpdateValidation([], []);
    expect(component.state.validationResults.length).toBe(1);
    const otherValidationResult = ['Another error'];
    ffUpdateValidation([], otherValidationResult);
    expect(component.state.validationResults.length).toBe(2);
    expect(component.canSubmit()).toBe(false);

    // Begin clearing errors
    ffUpdateValidation(validationResult, []);
    expect(component.state.validationResults.length).toBe(1);
    ffUpdateValidation(otherValidationResult, []);
    expect(component.state.validationResults.length).toBe(0);
    expect(component.canSubmit()).toBe(true);
  });
});
