import PropTypes from 'prop-types';

import Subscriber from '../Subscriber/';

export default class WithSubmit extends Subscriber {
  static propTypes = {
    ...Subscriber.propTypes,
    /**
     * A render function that will receive information on the status of the form.
     * @param {Object} status
     *   An object containing flags such as whether the form can be submitted or is loading
     */
    children: PropTypes.func.isRequired,
  };

  static contextTypes = {
    ...Subscriber.contextTypes,
    ffIsLoading: PropTypes.func.isRequired,
    ffCanSubmit: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.oldIsLoading = undefined;
    this.oldCanSubmit = undefined;
  }

  componentDidMount() {
    super.componentDidMount();
    this.oldIsLoading = this.context.ffIsLoading();
    this.oldCanSubmit = this.context.ffCanSubmit();
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (super.shouldComponentUpdate(nextProps, nextState, nextContext)) { return true; }
    let shouldUpdate = false;

    const newIsLoading = this.context.ffIsLoading();
    if (newIsLoading !== this.oldIsLoading) {
      this.oldIsLoading = newIsLoading;
      shouldUpdate = true;
    }

    const newCanSubmit = this.context.ffCanSubmit();
    if (newCanSubmit !== this.oldCanSubmit) {
      this.oldCanSubmit = newCanSubmit;
      shouldUpdate = true;
    }

    return shouldUpdate;
  }

  render() {
    return this.props.children({
      isLoading: this.context.ffIsLoading(),
      canSubmit: this.context.ffCanSubmit(),
    }) || null;
  }
}
