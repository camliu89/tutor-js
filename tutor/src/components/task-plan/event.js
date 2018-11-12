import React from 'react';
import { idType } from 'shared';
import createReactClass from 'create-react-class';
import { Card, Container } from 'react-bootstrap';
import { pick } from 'lodash';
import classnames from 'classnames';
import { TaskPlanStore  } from '../../flux/task-plan';
import PlanFooter from './footer';
import PlanMixin from './plan-mixin';
import TaskPlanBuilder from './builder';

const EventPlan = createReactClass({
  displayName: 'EventPlan',
  mixins: [PlanMixin],

  propTypes: {
    id: idType.isRequired,
    courseId: idType.isRequired,
  },

  render() {
    const { id, courseId } = this.props;
    const builderProps = pick(this.state, 'isVisibleToStudents', 'isEditable', 'isSwitchable');
    const hasError = this.hasError();

    const formClasses = classnames('edit-event', 'dialog',
      { 'is-invalid-form': hasError });

    return (
      <div className="event-plan task-plan" data-assignment-type="event">
        <Card.Header>
          {this.builderHeader('external')}
        </Card.Header>
        <Card className={formClasses}>
          <Card.Body>
            <TaskPlanBuilder
              id={id}
              courseId={courseId}
              label="Event" {...builderProps}
            />
          </Card.Body>
        </Card>
        <PlanFooter
          id={id}
          courseId={courseId}
          onPublish={this.publish}
          onSave={this.save}
          onCancel={this.cancel}
          hasError={hasError}
          isVisibleToStudents={this.state.isVisibleToStudents}
          getBackToCalendarParams={this.getBackToCalendarParams}
          goBackToCalendar={this.goBackToCalendar}
        />
      </div>
    );
  },
});

export { EventPlan };
