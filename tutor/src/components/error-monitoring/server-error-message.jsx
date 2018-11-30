import PropTypes from 'prop-types';
import { React, observer } from '../../helpers/react';
import { map, get, isObject } from 'lodash';
import { makeContactURL } from '../../helpers/contact';
const SUPPORT_LINK_PARAMS = '&cu=1&fs=ContactUs&q=';


const ServerErrorMessage = observer((props) => {
  let dataMessage, debugInfo;
  let { status, statusMessage, config, debug, data } = props;
  if (statusMessage == null) { statusMessage = 'No response was received'; }
  if (status == null) { status = 0; }

  const noStatusMessage = status ? '' : <h4>It looks like your internet connection was interrupted,<br />please check your connection and retry</h4>;

  const errorsMessage = (
    <span>
      {map(get(data, 'errors', [{ code: statusMessage }]),'code').join(', ')}
    </span>
  );

  if (config.data) {
    dataMessage = <span>with <pre>{config.data}</pre></span>;
  }

  if (debug) {
    debugInfo = [
      <p key="error-note">
        Additional error messages returned from the server is:
      </p>,
      <pre key="errors" className="response">
        {errorsMessage}
      </pre>,
      <div key="request" className="request">
        <kbd>{config.method}</kbd> on {config.url} {dataMessage}
      </div>,
    ];
  }

  const mailTo = makeContactURL({ status, statusMessage, config });

  return (
    <div className="server-error">
      <h3>
        An error with code {status} has occured
      </h3>
      {noStatusMessage}
      <p>
        Please <a href={mailTo}>contact us</a> to file a bug report.
      </p>
      {debugInfo}
    </div>
  );
});

ServerErrorMessage.displayName = 'ServerErrorMessage';

ServerErrorMessage.propTypes = {
  status: PropTypes.number,
  data: PropTypes.object,
  statusMessage: PropTypes.string,
  config: PropTypes.object,
  debug: PropTypes.bool,
};

ServerErrorMessage.defaultProps = {
  config: {},
  debug: true,
};

export default ServerErrorMessage;
