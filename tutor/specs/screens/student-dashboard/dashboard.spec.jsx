import { React, Router, TimeMock } from '../../helpers';
import Dashboard from '../../../src/screens/student-dashboard/dashboard';
import Factory from '../../factories';
import { bootstrapCoursesList } from '../../courses-test-data';
import Raven from '../../../src/models/app/raven';

jest.mock('../../../src/models/app/raven');

describe('Student Dashboard', () => {
  let props;

  TimeMock.setTo('2015-10-14T12:00:00.000Z');

  beforeEach(() => {
    const course = bootstrapCoursesList().get(1);
    Factory.studentTaskPlans({ course, attributes: { now: new Date('2015-10-21T12:00:00.000Z') } });
    course.studentTaskPlans.fetch = jest.fn();
    course.studentTaskPlans.fetch.mockReturnValue(new Promise(done => {
      done();
    }));
    props = {
      course,
      params: {},
    };
  });

  it('matches snapshot', () => {
    props.course.studentTaskPlans.all_tasks_are_ready = false;
    props.course.primaryRole.joined_at = new Date('2015-09-14T12:00:00.000Z');
    expect.snapshot(<Router><Dashboard {...props} /></Router>).toMatchSnapshot();
  });

  it('displays as loading', () => {
    props.course.studentTaskPlans.all_tasks_are_ready = false;
    props.course.primaryRole.joined_at = new Date('2015-10-14T12:00:00.000Z');
    const dash = mount(<Router><Dashboard {...props} /></Router>);
    expect(dash).toHaveRendered('ThisWeekCard Card[className="empty pending"]');
    expect.snapshot(<Router><Dashboard {...props} /></Router>).toMatchSnapshot();
  });

  it('logs when Biglearn times out', () => {
    props.course.studentTaskPlans.all_tasks_are_ready = false;
    const tp = props.course.studentTaskPlans;
    tp.api.requestCounts.read = 30;
    expect(tp.taskReadinessTimedOut).toBe(true);
    tp.startFetching();
    tp.stopFetching();
    expect(Raven.log).toHaveBeenCalled();
  });

});
