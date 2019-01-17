import PropTypes from 'prop-types';
import React from 'react';
import { computed } from 'mobx';
import { observer, inject } from 'mobx-react';
import StudentDashboard from './dashboard';
import Courses from '../../models/courses-map';
import WarningModal from '../../components/warning-modal';
import './styles.scss';

export default
@inject((allStores, props) => ({ tourContext: ( props.tourContext || allStores.tourContext ) }))
@observer
class StudentDashboardShell extends React.Component {

  static propTypes = {
    params: PropTypes.shape({
      courseId: PropTypes.string,
    }).isRequired,
    tourContext: PropTypes.object,
  }

  @computed get course() {
    return Courses.get(this.props.params.courseId);
  }

  renderNotAStudent() {
    let onDismiss;
    if (Courses.size) { onDismiss = this.goToMyCourses; }
    return (
      <WarningModal
        onDismiss={onDismiss}
        title="Sorry, you can’t access this course"
        message="You are no longer a student in this course. Please contact your instructor if you are still enrolled in this course and need to be re-added."
      />
    );
  }

  render() {
    if (!this.course) { return this.renderNotAStudent(); }

    return (
      <StudentDashboard params={this.props.params} course={this.course} />
    );
  }

};
