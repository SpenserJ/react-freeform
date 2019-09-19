import React from 'react';
import { mount } from 'enzyme';
import sinon from 'sinon';

import Subscriber, { Subscription } from '.';

describe('components/Subscriber: Subscription', () => {
  test('subscribes and unsubscribes through context', () => {
    let subscribedWith;
    const mockSubscriber = {
      context: {
        formSubscription: {
          subscribe: sinon.spy((callback) => {
            expect(typeof callback).toBe('function');
            subscribedWith = callback;
          }),
          unsubscribe: sinon.spy((callback) => {
            expect(typeof callback).toBe('function');
            if (typeof subscribedWith !== 'undefined') {
              expect(callback).toBe(subscribedWith);
            }
          }),
        },
      },
    };
    const subscription = new Subscription(mockSubscriber, () => {});
    expect(mockSubscriber.context.formSubscription.subscribe.notCalled).toBe(true);
    expect(mockSubscriber.context.formSubscription.unsubscribe.notCalled).toBe(true);
    subscription.trySubscribe();
    expect(mockSubscriber.context.formSubscription.subscribe.calledOnce).toBe(true);
    expect(mockSubscriber.context.formSubscription.unsubscribe.calledOnce).toBe(true);

    // Confirm that we correctly tracked the subscription callback before we test unsubscribe
    expect(typeof subscribedWith).toBe('function');

    subscription.tryUnsubscribe();
    expect(mockSubscriber.context.formSubscription.unsubscribe.calledTwice).toBe(true);
  });
});

describe('components/Subscriber: Subscriber', () => {
  test('(un)subscribes when the component (un)mounts', () => {
    const context = {
      formSubscription: {
        subscribe: sinon.spy(() => {}),
        unsubscribe: sinon.spy(() => {}),
      },
    };
    const wrapper = mount(<Subscriber />, { context });
    expect(context.formSubscription.subscribe.calledOnce).toBe(true);
    expect(context.formSubscription.unsubscribe.calledOnce).toBe(true);
    wrapper.unmount();
    expect(context.formSubscription.subscribe.calledOnce).toBe(true);
    expect(context.formSubscription.unsubscribe.calledTwice).toBe(true);
  });

  test('tries to trigger a render when subscription is updated', () => {
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
    expect(setStateSpy.called).toBe(false);
    expect(shouldComponentUpdateSpy.called).toBe(false);
    update();
    expect(setStateSpy.calledOnce).toBe(true);
    expect(shouldComponentUpdateSpy.calledOnce).toBe(true);
    expect(shouldComponentUpdateSpy.alwaysReturned(false)).toBe(true);
    wrapper.setProps({ a: true });
    expect(setStateSpy.calledOnce).toBe(true);
    expect(shouldComponentUpdateSpy.calledTwice).toBe(true);
    expect(shouldComponentUpdateSpy.alwaysReturned(false)).toBe(false);

    setStateSpy.restore();
    shouldComponentUpdateSpy.restore();
  });
});
