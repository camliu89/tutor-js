import PropTypes from 'prop-types';
import React from 'react';
import { action, computed } from 'mobx';
import { observer, inject } from 'mobx-react';
import { Modal, Button } from 'react-bootstrap';
import classnames from 'classnames';
import Branding from './branding/course';
import User from '../models/user';
import { map } from 'lodash';
import String from '../helpers/string';
import ModalManager from './modal-manager';

export default
@inject('modalManager')
@observer
class TermsModal extends React.Component {
    
  static propTypes = {
    modalManager: PropTypes.instanceOf(ModalManager).isRequired,
  }

  @computed get title() {
    return String.toSentence(map(User.terms.unsigned, 'title'));
  }

  @action.bound onAgreement() { User.terms.sign(); }

  componentDidMount() {
    this.props.modalManager.queue(this, 1);
  }

  // for terms to be displayed the user must be in a course and need them signed
  @computed get isReady() {
    return User.shouldSignTerms;
  }

  render() {
    if (!this.props.modalManager.canDisplay(this) || !this.isReady) { return null; }

    const className = classnames('user-terms', { 'is-loading': User.terms.api.isPending });

    return (
      <Modal
        show={true}
        backdrop="static"
        backdropClassName={className}
        className={className}
      >
        <Modal.Header>
          <Branding isBeta={true} /> {this.title}
        </Modal.Header>
        <Modal.Body>
          {map(User.terms.unsigned, (t) =>
            <div key={t.id}>
              <h1 className="title">{t.title}</h1>
              <div dangerouslySetInnerHTML={{ __html: t.content }} />
            </div>)}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={this.onAgreement}>I agree</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
