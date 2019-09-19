import ValueSubscriber from '.';

export default class JSONValue extends ValueSubscriber {
  render() { return JSON.stringify(this.getValue()); }
}
