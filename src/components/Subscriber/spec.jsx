import React from 'react';
import { mount } from 'enzyme';

import Subscriber, { Subscription } from '.';

describe('components/Subscriber: Subscription', () => {
  test('subscribes and unsubscribes through context', () => {
    let subscribedWith;
    const mockSubscriber = {
      context: {
        formSubscription: {
          subscribe: jest.fn((callback) => {
            expect(typeof callback).toBe('function');
            subscribedWith = callback;
          }),
          unsubscribe: jest.fn((callback) => {
            expect(typeof callback).toBe('function');
            if (typeof subscribedWith !== 'undefined') {
              expect(callback).toBe(subscribedWith);
            }
          }),
        },
      },
    };
    const subscription = new Subscription(mockSubscriber, () => {});
    expect(mockSubscriber.context.formSubscription.subscribe).not.toHaveBeenCalled();
    expect(mockSubscriber.context.formSubscription.unsubscribe).not.toHaveBeenCalled();
    subscription.trySubscribe();
    expect(mockSubscriber.context.formSubscription.subscribe).toHaveBeenCalledTimes(1);
    expect(mockSubscriber.context.formSubscription.unsubscribe).toHaveBeenCalledTimes(1);

    // Confirm that we correctly tracked the subscription callback before we test unsubscribe
    expect(typeof subscribedWith).toBe('function');

    subscription.tryUnsubscribe();
    expect(mockSubscriber.context.formSubscription.unsubscribe).toHaveBeenCalledTimes(2);
  });
});

describe('components/Subscriber: Subscriber', () => {
  test('(un)subscribes when the component (un)mounts', () => {
    const context = {
      formSubscription: {
        subscribe: jest.fn(() => {}),
        unsubscribe: jest.fn(() => {}),
      },
    };
    const wrapper = mount(<Subscriber />, { context });
    expect(context.formSubscription.subscribe).toHaveBeenCalledTimes(1);
    expect(context.formSubscription.unsubscribe).toHaveBeenCalledTimes(1);
    wrapper.unmount();
    expect(context.formSubscription.subscribe).toHaveBeenCalledTimes(1);
    expect(context.formSubscription.unsubscribe).toHaveBeenCalledTimes(2);
  });

  test('tries to trigger a render when subscription is updated', () => {
    let update;
    const context = {
      formSubscription: {
        subscribe: (callback) => { update = callback; },
        unsubscribe: () => {},
      },
    };
    const setStateSpy = jest.spyOn(Subscriber.prototype, 'setState');
    const shouldComponentUpdateSpy = jest.spyOn(Subscriber.prototype, 'shouldComponentUpdate');

    const wrapper = mount(<Subscriber />, { context });
    expect(setStateSpy).not.toHaveBeenCalled();
    expect(shouldComponentUpdateSpy).not.toHaveBeenCalled();
    update();
    expect(setStateSpy).toHaveBeenCalledTimes(1);
    expect(shouldComponentUpdateSpy).toHaveBeenCalledTimes(1);
    expect(shouldComponentUpdateSpy).toHaveLastReturnedWith(false);
    wrapper.setProps({ a: true });
    expect(setStateSpy).toHaveBeenCalledTimes(1);
    expect(shouldComponentUpdateSpy).toHaveBeenCalledTimes(2);
    expect(shouldComponentUpdateSpy).toHaveLastReturnedWith(true);
  });
});
