import { React, observer } from 'vendor';
import { Button } from 'react-bootstrap';

const BackButton = observer(({ ux }) => {
  if (!ux.canGoBackward) { return null; }
  return (
    <Button onClick={ux.goBackward} className="back">
      Back
    </Button>
  );
});

export default BackButton;
