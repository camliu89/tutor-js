import React from 'react';
import { isFunction, partial } from 'lodash'
import classnames from 'classnames';
import keymaster from 'keymaster';
import Icon from './icon';
import Arrow from './icons/arrow';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

const KEYBINDING_SCOPE  = 'page-navigation';

@observer
export default class PagingNavigation extends React.PureComponent {

  static propTypes = {
    children:             React.PropTypes.node.isRequired,
    onForwardNavigation:  React.PropTypes.func.isRequired,
    onBackwardNavigation: React.PropTypes.func.isRequired,
    isForwardEnabled:     React.PropTypes.bool.isRequired,
    isBackwardEnabled:    React.PropTypes.bool.isRequired,
    className:            React.PropTypes.string,
    forwardHref:          React.PropTypes.string,
    backwardHref:         React.PropTypes.string,
    enableKeys:           React.PropTypes.bool,
    titles:               React.PropTypes.shape({
      next:     React.PropTypes.string,
      current:  React.PropTypes.string,
      previous: React.PropTypes.string,
    }),
    documentImpl: React.PropTypes.shape({
      title: React.PropTypes.string,
    }),
  }

  static defaultProps = {
    enableKeys: true,
    forwardHref: '#',
    backwardHref: '#',
    titles: {
      next: 'Go Forward',
      previous: 'Go Back',
    },
    documentImpl: window.document,
  }

  @observable activeNav;
  @observable pendingTimeOut;

  componentWillMount() {
    if (this.props.enableKeys) { this.enableKeys(); }
    if (this.props.titles.current) { this.props.documentImpl.title = this.props.titles.current; }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.enableKeys && !this.props.enableKeys) {
      this.enableKeys();
    } else if (!nextProps.enableKeys && this.props.enableKeys) {
      this.disableKeys();
    }
    if (nextProps.titles.current) {
      this.props.documentImpl.title = nextProps.titles.current;
    } else {
      this.setDefaultTitle();
    }
  }

  componentWillUnmount() {
    if (this.pendingTimeOut) {
      clearTimeout(this.pendingTimeout);
    }
    this.setDefaultTitle();
    this.disableKeys();
  }

  setDefaultTitle() {
    this.props.documentImpl.title = 'OpenStax Tutor';
  }

  enableKeys() {
    keymaster('left' , KEYBINDING_SCOPE, this.keyOnPrev);
    keymaster('right', KEYBINDING_SCOPE, this.keyOnNext);
    keymaster.setScope(KEYBINDING_SCOPE);
  }

  disableKeys() {
    keymaster.deleteScope(KEYBINDING_SCOPE);
  }

  toggleNavHighlight(type) {
    this.activeNav = type;
    this.pendingTimeOut = setTimeout(() => {
      this.pendingTimeOut = this.activeNav = null;
    }, 300);
  }

  @action.bound
  keyOnPrev() {
    if (this.props.isBackwardEnabled) {
      this.toggleNavHighlight('prev');
      this.props.onBackwardNavigation(this.props.backwardHref);
    }
  }

  @action.bound
  keyOnNext() {
    if (this.props.isForwardEnabled) {
      this.toggleNavHighlight('next');
      this.props.onForwardNavigation(this.props.forwardHref);
    }
  }

  clickHandler(action, href, ev) {
    ev.preventDefault();
    if (isFunction(action)) { action(href); }
    window.scrollTo(0,0);
  }

  renderPrev() {
    const cb = this.props.isBackwardEnabled ? this.props.onBackwardNavigation : null;
    return (
      <a
        href={this.props.backwardHref}
        target="_blank"
        tabIndex={this.props.isBackwardEnabled ? 0 : -1}
        disabled={cb == null}
        title={this.props.titles.previous}
        onClick={partial(this.clickHandler, cb, this.props.backwardHref)}
        className={classnames('paging-control', 'prev', { active: this.activeNav === 'prev' })}
      >
        <div className="arrow-wrapper">
          <Arrow direction="left" />
        </div>
      </a>
    );
  }

  renderNext() {
    const cb = this.props.isForwardEnabled ? this.props.onForwardNavigation : null;
    return (
      <a
        href={this.props.forwardHref}
        tabIndex={this.props.isForwardEnabled ? 0 : -1}
        disabled={cb == null}
        title={this.props.titles.next}
        onClick={partial(this.clickHandler, cb, this.props.forwardHref)}
        className={classnames('paging-control', 'next', { active: this.activeNav === 'next' })}
      >
        <div className="arrow-wrapper">
          <Arrow direction="right" />
        </div>
      </a>
    );
  }

  render() {
    return (
      <div className={classnames('tutor-paging-navigation', this.props.className)}>
        {this.renderPrev()}
        <div className="paged-content" tabIndex="0">
          {this.props.children}
        </div>
        {this.renderNext()}
      </div>
    );
  }
}