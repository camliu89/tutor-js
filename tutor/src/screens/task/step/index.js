import { React, PropTypes } from '../../../helpers/react';
import {
  Facebook as ReadingLoader,
  BulletList as HomeworkLoader,
} from 'react-content-loader';
import Reading from './reading';

import Exercise from './exercise';
import Interactive from './interactive';
import End from './end';
import UX from '../ux';
import { StepCard } from './card';

import {
  PersonalizedGroup,
  TwoStepValueProp,
  IndividualReview,
  SpacedPractice,
} from './value-props';

const Unknown = ({ step }) => (
  <h1>Unknown step type "{step.type || 'null'}"</h1>
);

Unknown.propTypes = {
  step: PropTypes.shape({
    type: PropTypes.string.isRequired,
  }).isRequired,
};

export { Unknown };


const STEP_TYPES = {
  end: End,
  reading: Reading,
  exercise: Exercise,
  interactive: Interactive,

  'two-step-intro': TwoStepValueProp,
  'personalized-intro': PersonalizedGroup,
  'spaced-practice-intro': SpacedPractice,
  'individual-review-intro': IndividualReview,
};

const PENDING_TYPES = {
  exercise: HomeworkLoader,
  reading: ReadingLoader,
  interactive: Interactive.Loader,
};

const TaskStep = (props) => {
  const { ux, step: { isMultiPart, type, needsFetched } } = props;

  const stepProps = {
    ...props,
    onContinue: ux.canGoForward ? ux.goForward : null,
  };

  if (isMultiPart) {
    return (
      <React.Fragment>
        {props.step.steps.map(s =>
          <TaskStep key={s.id} {...stepProps} step={s} />)}
      </React.Fragment>
    );
  }

  if (needsFetched) {
    const Pending = PENDING_TYPES[type] || PENDING_TYPES.reading;
    return <StepCard><Pending /></StepCard>;
  }

  const Step = STEP_TYPES[type] || Unknown;

  return (
    <Step {...stepProps} />
  );
};

TaskStep.propTypes = {
  pending: PropTypes.func,
  ux: PropTypes.instanceOf(UX).isRequired,
  isMultiPart: PropTypes.bool,
  step: PropTypes.shape({
    steps: PropTypes.array,
    type: PropTypes.string.isRequired,
    needsFetched: PropTypes.bool,
  }).isRequired,
};

export default TaskStep;
