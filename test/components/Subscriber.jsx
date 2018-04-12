import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import sinon from 'sinon';

import Subscriber, { Subscription } from 'react-freeform/components/Subscriber';

describe('components/Subscriber: Subscription', () => {
  it('subscribes and unsubscribes through context', () => {
    let subscribedWith;
    const mockSubscriber = {
      context: {
        formSubscription: {
          subscribe: sinon.spy((callback) => {
            expect(callback).to.be.a('function');
            subscribedWith = callback;
          }),
          unsubscribe: sinon.spy((callback) => {
            expect(callback).to.be.a('function');
            if (typeof subscribedWith !== 'undefined') {
              expect(callback).to.equal(subscribedWith);
            }
          }),
        },
      },
    };
    const subscription = new Subscription(mockSubscriber, () => {});
    expect(mockSubscriber.context.formSubscription.subscribe.notCalled).to.equal(true);
    expect(mockSubscriber.context.formSubscription.unsubscribe.notCalled).to.equal(true);
    subscription.trySubscribe();
    expect(mockSubscriber.context.formSubscription.subscribe.calledOnce).to.equal(true);
    expect(mockSubscriber.context.formSubscription.unsubscribe.calledOnce).to.equal(true);

    // Confirm that we correctly tracked the subscription callback before we test unsubscribe
    expect(subscribedWith).to.be.a('function');

    subscription.tryUnsubscribe();
    expect(mockSubscriber.context.formSubscription.unsubscribe.calledTwice).to.equal(true);
  });
});

describe('components/Subscriber: Subscriber', () => {
  it('(un)subscribes when the component (un)mounts', () => {
    const context = {
      formSubscription: {
        subscribe: sinon.spy(() => {}),
        unsubscribe: sinon.spy(() => {}),
      },
    };
    const wrapper = mount(<Subscriber />, { context });
    expect(context.formSubscription.subscribe.calledOnce).to.equal(true);
    expect(context.formSubscription.unsubscribe.calledOnce).to.equal(true);
    wrapper.unmount();
    expect(context.formSubscription.subscribe.calledOnce).to.equal(true);
    expect(context.formSubscription.unsubscribe.calledTwice).to.equal(true);
  });

  it('tries to trigger a render when subscription is updated', () => {
    let update;
    const context = {
      formSubscription: {
        subscribe: (callback) => { update = callback; },
        unsubscribe: () => {},
      },
    };
    const setStateSpy = sinon.spy(Subscriber.prototype, 'setState');
    const shouldComponentUpdateSpy = sinon.spy(Subscriber.prototype, 'shouldComponentUpdate');

    const wrapper = mount(<Subscriber />, { context });
    expect(setStateSpy.called).to.equal(false);
    expect(shouldComponentUpdateSpy.called).to.equal(false);
    update();
    expect(setStateSpy.calledOnce).to.equal(true);
    expect(shouldComponentUpdateSpy.calledOnce).to.equal(true);
    expect(shouldComponentUpdateSpy.alwaysReturned(false)).to.equal(true);
    wrapper.setProps({ a: true });
    expect(setStateSpy.calledOnce).to.equal(true);
    expect(shouldComponentUpdateSpy.calledTwice).to.equal(true);
    expect(shouldComponentUpdateSpy.alwaysReturned(false)).to.equal(false);

    setStateSpy.restore();
    shouldComponentUpdateSpy.restore();
  });
});
