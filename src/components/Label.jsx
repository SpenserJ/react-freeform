import React from 'react';
import PropTypes from 'prop-types';

export default class Label extends React.PureComponent {
  static propTypes = {
    htmlFor: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
    component: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
    children: PropTypes.node,
  };

  static defaultProps = {
    component: 'label',
    children: null,
  };

  static contextTypes = {
    nfFullName: PropTypes.func.isRequired,
    nfFormIndex: PropTypes.number.isRequired,
  };

  render() {
    const {
      component: Component,
      htmlFor,
      children,
      ...restProps
    } = this.props;
    return (
      <Component
        {...restProps}
        htmlFor={[this.context.nfFormIndex].concat(this.context.nfFullName(), htmlFor).join('.')}
      >
        {children}
      </Component>
    );
  }
}
