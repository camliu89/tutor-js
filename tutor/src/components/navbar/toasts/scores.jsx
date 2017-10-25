import React from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import { Button } from 'react-bootstrap';
import Icon from '../../icon';
import WarningModal from '../../warning-modal';
import SupportEmailLink from '../../support-email-link';
import { JobCompletion } from '../../../models/jobs/queue';

export function Success({ job: { info: { url } } }) {
  return (
    <div className="toast scores success">
      Scores successfully exported
      <iframe id="downloadExport" src={url} />
    </div>
  );
}

@observer
export class Failure extends React.Component {

  static propTypes = {
    dismiss: React.PropTypes.func.isRequired,
    job: React.PropTypes.instanceOf(JobCompletion).isRequired,
  }

  @observable showDetails = false;
  @action.bound onShowDetails() { this.showDetails = true; }

  render() {
    if (this.showDetails) {
      return (
        <WarningModal
          backdrop={false}
          title="Scores not exported"
          footer={<Button onClick={this.props.dismiss}>Close</Button>}
        >
          The scores spreadsheet could not be exported. Return
          to the student scores page to try again.  If
          this problem persists, please contact <SupportEmailLink />.
        </WarningModal>
      );
    }
    return (
      <div className="toast scores failure">
        <div className="heading">
          Scores not exported
          <Icon type="close" onClick={this.props.dismiss} />
        </div>
        <Button bsStyle="link" onClick={this.onShowDetails}>Details</Button>
      </div>
    );
  }
}