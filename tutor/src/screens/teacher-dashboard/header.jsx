import { React, observer } from '../../helpers/react';
import Course from '../../models/course';
import TourAnchor from '../../components/tours/anchor';
import TutorLink from '../../components/link';
import BrowseTheBook from '../../components/buttons/browse-the-book';
import NoPeriods from '../../components/no-periods';
import SidebarToggle from './sidebar-toggle';

const CourseCalendarHeader = observer((props) => {
  const { course, hasPeriods, defaultOpen } = props;
  return (
    <div className="calendar-header">
      {!hasPeriods ? <NoPeriods courseId={course.id} noPanel={true} /> : undefined}
      <SidebarToggle
        course={props.course}
        defaultOpen={defaultOpen}
        onToggle={props.onSidebarToggle} />
      <div className="calendar-header-actions-buttons">
        <BrowseTheBook bsStyle="default" courseId={course.id} />
        <TourAnchor id="question-library-button">
          <TutorLink className="btn btn-default" to="viewQuestionsLibrary" params={{ courseId: course.id }}>
            Question Library
          </TutorLink>
        </TourAnchor>
        <TourAnchor id="performance-forecast-button">
          <TutorLink className="btn btn-default" to="viewPerformanceGuide" params={{ courseId: course.id }}>
            Performance Forecast
          </TutorLink>
        </TourAnchor>
        <TourAnchor id="student-scores-button">
          <TutorLink className="btn btn-default" to="viewScores" params={{ courseId: course.id }}>
            Student Scores
          </TutorLink>
        </TourAnchor>
      </div>
    </div>
  );
});

CourseCalendarHeader.displayName = 'CourseCalendarHeader';

CourseCalendarHeader.propTypes = {
  hasPeriods: React.PropTypes.bool.isRequired,
  course: React.PropTypes.instanceOf(Course).isRequired,
  onSidebarToggle: React.PropTypes.func.isRequired,
  defaultOpen: React.PropTypes.bool,
};


export default CourseCalendarHeader;