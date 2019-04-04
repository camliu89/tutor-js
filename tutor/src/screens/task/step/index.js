import { React, PropTypes, observer } from '../../../helpers/react';
import {
  Facebook as ReadingLoader,
  BulletList as HomeworkLoader,
} from 'react-content-loader';
import ScrollTo from '../../../helpers/scroll-to';
import Reading from './reading';
import Exercise from './exercise';
import HtmlContent from './html-content';
import End from './end';
import UX from '../ux';
import { LoadingCard } from './card';

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
  video: HtmlContent,
  exercise: Exercise,
  interactive: HtmlContent,
  'two-step-intro': TwoStepValueProp,
  'personalized-intro': PersonalizedGroup,
  'spaced-practice-intro': SpacedPractice,
  'individual-review-intro': IndividualReview,
};

const PENDING_TYPES = {
  reading: ReadingLoader,
  exercise: HomeworkLoader,
  video: HtmlContent.Loader,
  interactive: HtmlContent.Loader,
};

@observer
class TaskStep extends React.Component {

  static propTypes = {
    pending: PropTypes.func,
    ux: PropTypes.instanceOf(UX).isRequired,
    step: PropTypes.shape({
      steps: PropTypes.array,
      type: PropTypes.string.isRequired,
      needsFetched: PropTypes.bool,
      fetchIfNeeded: PropTypes.func.isRequired,
    }).isRequired,
  };

  scroller = new ScrollTo();

  componentDidMount() {
    this.scroller.scrollToTop({ scrollTopOffset: -60 });
    this.props.step.fetchIfNeeded();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.step !== this.props.step) {
      this.props.step.fetchIfNeeded();
    }
  }

  render() {
    const { ux, step, step: { type, needsFetched } } = this.props;

    const stepProps = {
      ...this.props,
      onContinue: ux.canGoForward ? ux.goForward : null,
    };

    if ('mpq' === type) {
      return (
        <React.Fragment>
          {step.steps.map((s, i) =>
            <TaskStep key={i} {...stepProps} step={s} />)}
        </React.Fragment>
      );
    }

    if (needsFetched) {
      const Pending = PENDING_TYPES[type] || PENDING_TYPES.reading;
      return <LoadingCard><Pending /></LoadingCard>;
    }

    const Step = STEP_TYPES[type] || Unknown;

    return (
      <Step {...stepProps} />
    );
  }
}

export { TaskStep };
