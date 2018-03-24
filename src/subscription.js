export default class Subscription {
  constructor(subscriber, name, onChange) {
    this.subscriber = subscriber;
    this.name = name;
    this.value = undefined;
    this.updateSubscriber = onChange;
  }

  trySubscribe(name) {
    if (!this.subscriber.context || !this.subscriber.context.formSubscription) { return; }
    this.name = name;

    this.tryUnsubscribe();
    this.value = this.getValue();
    this.subscriber.context.formSubscription.subscribe(this.onChange, []);
  }

  tryUnsubscribe() {
    if (!this.subscriber.context || !this.subscriber.context.formSubscription) { return; }
    this.subscriber.context.formSubscription.unsubscribe(this.onChange, []);
  }

  onChange = () => {
    const newValue = this.getValue();
    if (newValue === this.value) { return; }
    // Trigger a re-render
    this.value = newValue;
    this.updateSubscriber(newValue);
  }

  getValue = () => {
    if (!this.subscriber.context || !this.subscriber.context.injector()) { return undefined; }
    const value = this.subscriber.context.injector().getValue();
    if (!value) { return value; }
    return this.name ? value[this.name] : value;
  }
}
