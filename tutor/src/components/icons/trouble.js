import { React, PropTypes } from '../../helpers/react';
import { Icon } from 'shared';
import TaskPlan from '../../models/task-plan/teacher';
import Theme from '../../theme';

export default
function TroubleIcon({ plan, ...iconProps }) {
  if (!plan.is_trouble) { return null; }

  return (
    <Icon
      tooltip="Students may be having difficulty with this assignment"
      color={Theme.colors.danger}
      type="bookmark"
      rotation={90}
      {...iconProps}
    />
  );
}

TroubleIcon.propTypes = {
  plan: PropTypes.instanceOf(TaskPlan).isRequired,
};
