import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import Name from '../../components/name';
import TutorLink from '../../components/link';
const TOOLTIP_OPTIONS = { enable: true, placement: 'top', delayShow: 1500, delayHide: 150 };

export default
@observer
class NameCell extends React.Component {

  static propTypes = {
    courseId: PropTypes.string.isRequired,
    className: PropTypes.string,
    students: PropTypes.array.isRequired,
    rowIndex: PropTypes.number,
  }

  render() {
    const student = this.props.students[this.props.rowIndex || 0];

    const children = [
      <Name
        key="name"
        tooltip={TOOLTIP_OPTIONS}
        className="student-name"
        {...student} />,
      <span key="id" className="student-id">
        {student.student_identifier}
      </span>,
    ];
    const classname = classnames('name-cell', this.props.className);

    return (
      <div className="name-cell-wrapper">
        <TutorLink
          to="viewPerformanceGuide"
          className={classname}
          params={{ roleId: student.role, courseId: this.props.courseId }}>
          {children}
        </TutorLink>
        <div className="name-cell">
          {(student.average_score != null) ? `${(student.average_score * 100).toFixed(0)}%` : undefined}
        </div>
      </div>
    );
  }
};
