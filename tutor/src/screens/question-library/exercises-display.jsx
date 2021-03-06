import {
  React, PropTypes, observable, action, observer, computed, ArrayOrMobxType,
} from 'vendor';
import { Button } from 'react-bootstrap';
import { isEmpty, uniq, compact, map } from 'lodash';
import Loading from 'shared/components/loading-animation';
import { Icon } from 'shared';
import ExerciseControls from './exercise-controls';
import ExerciseDetails from '../../components/exercises/details';
import ExerciseCards from '../../components/exercises/cards';
import ScrollSpy from '../../components/scroll-spy';
import Sectionizer from '../../components/exercises/sectionizer';
import ExerciseHelpers from '../../helpers/exercise';
import Dialog from '../../components/tutor-dialog';
import TourRegion from '../../components/tours/region';
import Course from '../../models/course';
import sharedExercises, { ExercisesMap } from '../../models/exercises';

const ExerciseDetailsWrapper = props => (
  <TourRegion id="question-library-details" courseId={props.course.id}>
    <ExerciseDetails {...props} />
  </TourRegion>
);
ExerciseDetailsWrapper.propTypes = {
  course: PropTypes.instanceOf(Course).isRequired,
};

const ExerciseCardsWrapper = props => (
  <TourRegion
    id="question-library-exercises"
    otherTours={['preview-question-library-exercises']}
    course={props.course.id}
  >
    <ExerciseCards {...props} />
  </TourRegion>
);
ExerciseCardsWrapper.propTypes = {
  course: PropTypes.instanceOf(Course).isRequired,
};

@observer
class ExercisesDisplay extends React.Component {

  static displayName = 'ExercisesDisplay';

  static propTypes = {
    course:                 PropTypes.instanceOf(Course).isRequired,
    pageIds:                ArrayOrMobxType.isRequired,
    exercises:              PropTypes.instanceOf(ExercisesMap),
    showingDetails:         PropTypes.bool.isRequired,
    onSelectSections:       PropTypes.func.isRequired,
    onShowCardViewClick:    PropTypes.func.isRequired,
    onShowDetailsViewClick: PropTypes.func.isRequired,
  };

  static defaultProps = {
    exercises: sharedExercises,
  };

  @observable filter = 'reading';
  @observable currentSection;
  @observable showingDetails = false;
  @observable displayFeedback = false;

  onFilterChange = (filter) => {
    this.filter = filter;
  };

  // called by sectionizer and details view
  setCurrentSection = (currentSection) => {
    this.currentSection = currentSection;
  };

  @action.bound onShowDetailsViewClick(ev, exercise) {
    this.selectedExercise = exercise.wrapper;
    this.currentSection = this.selectedExercise.page.chapter_section;
    this.props.onShowDetailsViewClick(ev, this.selectedExercise);
  }

  @action.bound onShowCardViewClick(ev, exercise) {
    this.fromDetailsExercise = exercise;
    this.props.onShowCardViewClick(ev, this.fromDetailsExercise);
  }

  renderMinimumExclusionWarning = (minExerciseCount) => {
    return (
      [
        <Icon key="icon" type="exclamation" />,
        <div key="message" className="message">
          <p>
            Tutor needs at least {minExerciseCount} questions for this section to be
            included in spaced practice and personalized learning.
          </p>
          <p>
            If you exclude too many, your students will not get
            to practice on topics in this section.
          </p>
        </div>,
      ]
    );
  };

  onExerciseToggle = (ev, exerciseContent) => {
    const { exercises } = this.props;
    let minExerciseCount;
    const exercise = exerciseContent.wrapper;
    // const isSelected = !ExerciseStore.isExerciseExcluded(exercise.id);
    const is_excluded = !exercise.is_excluded;
    if (is_excluded) {
      minExerciseCount = exercises.isMinimumExcludedForPage(exercise.page);
    }

    if (is_excluded && false !== minExerciseCount) {
      Dialog.show({
        className: 'question-library-min-exercise-exclusions',
        title: '', body: this.renderMinimumExclusionWarning(minExerciseCount),
        buttons: [
          <Button
            key="exclude"
            onClick={() => {
              this.props.course.saveExerciseExclusion({ exercise, is_excluded });
              Dialog.hide();
            }}
          >
            Exclude
          </Button>,
          <Button
            key="cancel"
            variant="primary"
            onClick={function() { return Dialog.hide(); }}
            variant="primary">
            Cancel
          </Button>,
        ],
      });
    } else {
      this.props.course.saveExerciseExclusion({ exercise, is_excluded });
    }

  };

  getExerciseActions = (exercise) => {
    const actions = {};
    if (this.getExerciseIsSelected(exercise)) {
      actions.include = {
        message: 'Re-Include question',
        handler: this.onExerciseToggle,
      };
    } else {
      actions.exclude = {
        message: 'Exclude question',
        handler: this.onExerciseToggle,
      };
    }
    if (this.props.showingDetails) {
      this.addDetailsActions(actions, exercise);
    } else {
      this.addCardActions(actions, exercise);
    }
    return actions;
  };

  addDetailsActions = (actions) => {
    if (this.displayFeedback) {
      actions['feedback-off'] = {
        message: 'Hide Feedback',
        handler: this.toggleFeedback,
      };
    } else {
      actions['feedback-on'] = {
        message: 'Preview Feedback',
        handler: this.toggleFeedback,
      };
    }
    return (
      actions['report-error'] = {
        message: 'Suggest a correction',
        handler: this.reportError,
      }
    );
  };

  addCardActions = (actions) => {
    return (
      actions.details = {
        message: 'Question details',
        handler: this.onShowDetailsViewClick,
      }
    );
  };

  @action.bound reportError(ev, exercise) {
    ExerciseHelpers.openReportErrorPage(exercise.wrapper, this.props.course);
  }

  @action.bound toggleFeedback() {
    this.displayFeedback = !this.displayFeedback;
  }

  @computed get displayedChapterSections() {
    return uniq(compact(map(this.props.pageIds, (pageId) => {
      if (!this.props.exercises.forPageId(pageId).length) { return null; }
      const page = this.props.course.referenceBook.pages.byId.get(pageId);
      return (page && page.chapter_section.isPresent) ? page.chapter_section : null;
    })));
  }

  getExerciseIsSelected = (exercise) => {
    return exercise.is_excluded;
  };

  renderExercises = (exercises) => {

    const sharedProps = {
      exercises,
      course: this.props.course,
      book: this.props.course.referenceBook,
      pageIds: this.props.pageIds,
      onExerciseToggle: this.onExerciseToggle,
      getExerciseActions: this.getExerciseActions,
      getExerciseIsSelected: this.getExerciseIsSelected,
      topScrollOffset: 100,
    };

    if (this.props.showingDetails) {
      return (
        <ExerciseDetailsWrapper
          {...sharedProps}
          selectedExercise={this.selectedExercise}
          selectedSection={this.currentSection}
          onSectionChange={this.setCurrentSection}
          onExerciseToggle={this.onExerciseToggle}
          displayFeedback={this.displayFeedback}
          onShowCardViewClick={this.onShowCardViewClick} />
      );
    } else {
      return (
        <ExerciseCardsWrapper
          {...sharedProps}
          watchEvent="change-exercise-"
          onExerciseToggle={this.onExerciseToggle}
          focusedExercise={this.fromDetailsExercise}
          onShowDetailsViewClick={this.onShowDetailsViewClick} />
      );
    }
  };

  render() {
    const { pageIds, exercises } = this.props;
    if (isEmpty(pageIds)) {
      return null;
    }
    if (exercises.isFetching({ pageIds })) {
      return <Loading />;
    }

    let sectionizerProps;

    if (this.props.showingDetails) {
      sectionizerProps = {
        currentSection: this.currentSection,
        onSectionClick: this.setCurrentSection,
      };
    }
    return (
      <div className="exercises-display">
        <div className="sections-questions-view">
          <ExerciseControls
            onSelectSections={this.props.onSelectSections}
            filter={this.filter}
            course={this.props.course}
            showingDetails={this.props.showingDetails}
            onFilterChange={this.onFilterChange}
            onSectionSelect={this.scrollToSection}
            onShowCardViewClick={this.onShowCardViewClick}
            onShowDetailsViewClick={this.onShowDetailsViewClick}
            exercises={exercises}
          >
            <ScrollSpy dataSelector="data-section">
              <Sectionizer
                ref="sectionizer"
                {...sectionizerProps}
                nonAvailableWidth={600}
                onScreenElements={[]}
                chapter_sections={this.displayedChapterSections}
              />
            </ScrollSpy>
          </ExerciseControls>
          {this.renderExercises(this.filter ? exercises[this.filter] : exercises.all)}
        </div>
      </div>
    );
  }
}


export default ExercisesDisplay;
