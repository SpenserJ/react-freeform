import React from 'react';
import PropTypes from 'prop-types';
import handler from '../src/HOC/handler/';

class ExampleForm extends React.PureComponent {
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
        <pre style={{ ...style, overflow: 'auto' }}>{JSON.stringify(this.state.values, null, '  ')}</pre>
      </React.Fragment>
    );
  }
}

module.exports = handler(ExampleForm);
