import PropTypes from 'prop-types';
import React from 'react';
import { observer } from 'mobx-react';
import Exercise from '../../models/exercises/exercise';
import Attachment from './attachments/attachment';
import AttachmentChooser from './attachments/chooser';

function Attachments({ exercise }) {
  return (
    <div className="attachments">
      {exercise.attachments.map((attachment) =>
        <Attachment
          key={attachment.asset.url}
          attachment={attachment}
        />
      )}
      <AttachmentChooser exercise={exercise} />
    </div>
  );
}

Attachments.propTypes = {
  exercise: PropTypes.instanceOf(Exercise).isRequired,
};

export default observer(Attachments);
