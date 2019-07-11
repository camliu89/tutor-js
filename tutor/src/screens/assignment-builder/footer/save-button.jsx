import { React, PropTypes, observer } from '../../../helpers/react';
import TourAnchor from '../../../components/tours/anchor';
import { AsyncButton } from 'shared';

const MESSAGES = {
  publish: {
    action: 'Publish',
    waiting: 'Publishing…',
  },
  save: {
    action: 'Save',
    waiting: 'Saving…',
  },
};

const SaveButton = observer(({ ux, ux: { plan } }) => {
  const text = MESSAGES[plan.isPublished ? 'save' : 'publish'];

  return (
    <TourAnchor id="builder-save-button">
      <AsyncButton
        variant="primary"
        className="publish"
        disabled={!ux.canSave}
        onClick={ux.onPublish}
        isWaiting={ux.isSaving}
        waitingText={text.waiting}
      >
        {text.action}
      </AsyncButton>
    </TourAnchor>
  );
});
SaveButton.displayName = 'SaveButton';
SaveButton.propTypes = {
  ux: PropTypes.object.isRequired,
};

export default SaveButton;
