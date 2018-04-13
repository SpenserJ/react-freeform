import React from 'react';
import PropTypes from 'prop-types';
import handler from '../src/HOC/handler/';

export default handler(class extends React.PureComponent {
  static propTypes = {
    defaultValues: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    children: PropTypes.node.isRequired,
  }

  getDefaults() { return this.props.defaultValues; }

  render() {
    const style = { width: '50%', display: 'inline-block' };
    return (
      <React.Fragment>
        <div style={style}>{this.props.children}</div>
        <pre style={style}>{JSON.stringify(this.state.values)}</pre>
      </React.Fragment>
    );
  }
});
