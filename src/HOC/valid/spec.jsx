import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon';

import handler from '../handler';
import valid from '.';

class Test extends React.Component { getDefaults() { return { a: true }; } }

describe('HOC/valid', () => {
  it('extends class-based components', () => {
    const TestHandler = valid(handler(Test));
    expect(TestHandler.displayName).to.equal('valid(handler(Test))');
    expect(() => { valid(() => {}); }).to.throw('Cannot extend a functional component');
  });

  it("doesn't crash if used before handler", () => {
    const TestHandler = handler(valid(Test));
    expect(() => shallow(<TestHandler />).instance().getChildContext()).to.not.throw();
  });

  it('yields to super.canSubmit()', () => {
    const TestHandler = valid(handler(class extends Test { canSubmit() { return false; } }));
    const component = shallow(<TestHandler />).instance();
    expect(component.canSubmit()).to.equal(false);
  });

  it('can submit with no validation errors', () => {
    const TestHandler = valid(handler(Test));
    const component = shallow(<TestHandler />).instance();
    expect(component.canSubmit()).to.equal(true);
  });

  it('adds and removes validation arrays when called, and blocks sumbit accordingly', () => {
    const TestHandler = valid(handler(Test));
    const component = shallow(<TestHandler />).instance();
    const { ffUpdateValidation } = component.getChildContext();

    expect(component.state.validationResults.length).to.equal(0);

    // Handles initial mount
    ffUpdateValidation(undefined, []);
    expect(component.state.validationResults.length).to.equal(0);

    ffUpdateValidation([], []);
    expect(component.state.validationResults.length).to.equal(0);

    const validationResult = ['Error'];
    ffUpdateValidation([], validationResult);
    expect(component.state.validationResults.length).to.equal(1);
    // Shouldn't be able to submit the form with validation errors
    expect(component.canSubmit()).to.equal(false);

    // Test other components triggering their own validation
    ffUpdateValidation([], []);
    expect(component.state.validationResults.length).to.equal(1);
    const otherValidationResult = ['Another error'];
    ffUpdateValidation([], otherValidationResult);
    expect(component.state.validationResults.length).to.equal(2);
    expect(component.canSubmit()).to.equal(false);

    // Begin clearing errors
    ffUpdateValidation(validationResult, []);
    expect(component.state.validationResults.length).to.equal(1);
    ffUpdateValidation(otherValidationResult, []);
    expect(component.state.validationResults.length).to.equal(0);
    expect(component.canSubmit()).to.equal(true);
  });
});
