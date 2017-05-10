import React from 'react';

import Router                from '../../helpers/router';
import Courses               from '../../models/courses-map';
import TutorLink             from '../link';
import ServerErrorMonitoring from '../error-monitoring';
import ToursReplay           from './tours-replay';
import CourseName            from './course-name';
import UserActionsMenu       from './user-actions-menu';
import BookLinks             from './book-links';
import CenterControls        from './center-controls';
import PreviewAddCourseBtn   from './preview-add-course-btn';


export default class NavigationBar extends React.PureComponent {

  render() {
    const params = Router.currentParams();
    const { courseId } = params;
    const course = courseId ? Courses.get(courseId) : null;

    return (
      <nav className="tutor-top-navbar">
        <div className="left-side-controls">
          <TutorLink to="listing" className="brand">
            <i className="ui-brand-logo" />
          </TutorLink>
          <CourseName course={course} />
          <BookLinks courseId={courseId} />
        </div>
        <CenterControls params={params} />
        <div className="right-side-controls">
          <PreviewAddCourseBtn courseId={courseId} />
          <ToursReplay />
          <UserActionsMenu
            courseId={courseId}
          />
        </div>
        <ServerErrorMonitoring />
      </nav>
    );
  }
}
