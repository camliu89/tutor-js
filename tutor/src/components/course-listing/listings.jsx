import React from 'react';

import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { reject, filter, isEmpty, merge, map } from 'lodash';
import { Col, Row, Grid } from 'react-bootstrap';
import classnames from 'classnames';

import { ReactHelpers } from 'shared';
import Router from '../../helpers/router';
import TutorLink from '../link';
import { wrapCourseDropComponent } from './course-dnd';
import IconAdd from '../icons/add';

import Courses from '../../models/courses-map';
import User from '../../models/user';

import { CoursePreview, Course, CourseTeacher, CoursePropType } from './course';

function wrapCourseItem(Item, course = {}) {
  return (
    <Col key={`course-listing-item-wrapper-${course.id}`} md={3} sm={6} xs={12}>
      <Item
        course={course}
        courseSubject={course.subject}
        courseIsTeacher={course.isTeacher}
        courseDataProps={course.dataProps} />
    </Col>
  );
}


@wrapCourseDropComponent @observer
class AddCourseArea extends React.Component {

  static propTypes = {
    isHovering: React.PropTypes.bool,
    connectDropTarget: React.PropTypes.func.isRequired,
  }

  static contextTypes = {
    router: React.PropTypes.object,
  }

  onDrop(course) {
    const url = Router.makePathname('createNewCourse', { sourceId: course.id });
    this.context.router.transitionTo(url);
  }

  render() {
    return (
      this.props.connectDropTarget(
        <div className="course-listing-add-zone">
          <TutorLink
            to="createNewCourse"
            className={classnames({ 'is-hovering': this.props.isHovering })}>
            <div>
              <IconAdd />
              <span>
                Add a course
              </span>
            </div>
          </TutorLink>
        </div>
      )
    );
  }
}


function CourseListingNone() {
  return (
    <Row className="course-listing-none">
      <Col md={12}>
        <p>
          There are no current courses.
        </p>
      </Col>
    </Row>
  );
}

const CourseListingAdd = () => wrapCourseItem(AddCourseArea);

const DEFAULT_COURSE_ITEMS = {
  teacher: CourseTeacher,
  student: Course,
};


@observer
class CourseListingBase extends React.Component {

  static propTypes = {
    courses:    React.PropTypes.arrayOf(CoursePropType.isRequired).isRequired,
    items:      React.PropTypes.objectOf(React.PropTypes.element),
    className:  React.PropTypes.string,
    before:     React.PropTypes.element,
    after:      React.PropTypes.element,
  }

  @computed get items() {
    return merge({}, DEFAULT_COURSE_ITEMS, this.props.items);
  }

  renderCourse(course) {
    const Item = course.is_preview ? CoursePreview :
                 this.items[User.verifiedRoleForCourse(course)];
    return Item ? wrapCourseItem(Item, course) : null;
  }

  render() {
    const { courses, className, before, after } = this.props;

    const sectionClasses = classnames('course-listing-section', className);

    return (
      <Row className={sectionClasses}>
        {before}
        {map(courses, (course) => this.renderCourse(course))}
        {after}
      </Row>
    );
  }
}

@observer
class CourseListingTitle extends React.Component {
  static propTypes = {
    title: React.PropTypes.string.isRequired,
    main: React.PropTypes.bool,
  }

  static defaultProps = {
    main: false,
  }

  render() {
    const { title } = this.props;
    return (
      <Row className="course-listing-title">
        <Col md={12}>
          <h1>{title}</h1>
        </Col>
      </Row>
    );
  }
}

@observer
export class CourseListingCurrent extends React.PureComponent {

  render () {
    const baseName = ReactHelpers.getBaseName('CourseListingCurrent');
    const courses = reject(Courses.values(), 'hasEnded');

    return (
      <div className={baseName}>
        <Grid>
          <CourseListingTitle title="Current Courses" main={true} />
          {isEmpty(courses) ? <CourseListingNone /> : undefined}
          <CourseListingBase
            className={`${baseName}-section`}
            courses={courses}
            after={User.isTeacher ? <CourseListingAdd /> : undefined} />
        </Grid>
      </div>
    );
  }
}

@observer
class CourseListingBasic extends React.PureComponent {
  static propTypes = {
    title:    React.PropTypes.string.isRequired,
    baseName: React.PropTypes.string.isRequired,
    courses:  React.PropTypes.arrayOf(CoursePropType.isRequired).isRequired,
  }

  render() {
    const { courses, baseName, title } = this.props;
    if (isEmpty(courses)) { return null; }

    return (
      (
        <div className={baseName}>
          <BS.Grid>
            <CourseListingTitle title={title} />
            <CourseListingBase className={`${baseName}-section`} courses={courses} />
          </BS.Grid>
        </div>
      )
    );
  }
}

@observer
export class CourseListingPast extends React.PureComponent {
  render() {
    return (
      <CourseListingBasic
        courses={filter(Courses.values(), 'hasEnded')}
        baseName={ReactHelpers.getBaseName(this)}
        title="Past Courses"
      />
    );
  }
}


@observer
export class CourseListingFuture extends React.PureComponent {
  render() {
    return (
      <CourseListingBasic
        courses={reject(Courses.values(), 'hasStarted')}
        baseName={ReactHelpers.getBaseName(this)}
        title="Future Courses"
      />
    );
  }
}

// export { CourseListingPast, CourseListingCurrent, CourseListingFuture };
