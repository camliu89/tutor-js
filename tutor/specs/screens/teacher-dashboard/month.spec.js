import moment from 'moment';
import { React, Renderer, wrapInDnDTestContext, SnapShot } from '../../helpers';
import Month from '../../../src/screens/teacher-dashboard/month';
import Factory from '../../factories';
import TimeHelper from '../../../src/helpers/time';
import { DragDropManager } from 'dnd-core';

describe('CourseCalendar Month display', () => {
  let course;
  let props = {};

  beforeEach(() => {
    course = Factory.course({ is_teacher: true });
    Factory.taskPlans({ course });
    props = {
      date: course.taskPlans.array[0].duration.end(),
      course: course,
      termEnd: moment().add(2, 'month'),
      termStart: moment().subtract(3, 'month'),
      dateFormat: TimeHelper.ISO_DATE_FORMAT,
      hasPeriods: true,
      showingSideBar: true,
    };
  });

  it('renders plans and hides when deleting', function() {
    const M = wrapInDnDTestContext(Month);
    // Renderer.create(<M {...props} />)

    // console.log(typeof(M))
    const month = mount(<M {...props} />);
    console.log(month.debug())
    // const plan = course.taskPlans.array[0];
    // expect(month).toHaveRendered(`[data-plan-id="${plan.id}"]`);
    // plan.is_deleting = true;
    // expect(month).not.toHaveRendered(`[data-plan-id="${plan.id}"]`);
  });

});
