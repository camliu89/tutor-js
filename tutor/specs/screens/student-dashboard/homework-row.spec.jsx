import { React, TimeMock, Factory } from '../../helpers';

import Theme from '../../../src/theme';
import Row from '../../../src/screens/student-dashboard/event-row';

describe('Homework Row', function() {
  let props;
  const now = new Date('2017-10-14T12:00:00.000Z');
  TimeMock.setTo(now);

  beforeEach(function() {
    props = {
      event: Factory.studentDashboardTask({ type: 'homework', now }),
      course: Factory.course(),
    };
  });

  it('renders in progress', () => {
    props.event.completed_steps_count = 1;
    props.event.due_at = new Date('2017-10-15T12:00:00.000Z');
    expect.snapshot(<Row {...props} />).toMatchSnapshot();
  });

  it('renders with completed count', function() {
    props.event.correct_exercise_count = null;
    expect.snapshot(<Row {...props} />).toMatchSnapshot();
  });

  it('renders complete', function() {
    props.event.complete = true;
    props.event.completed_steps_count = 1;
    const row = mount(<Row {...props} />);
    expect(row.find('Col[className="feedback"]').text()).toEqual('1/6 correct0/6 answered on due date');
    row.unmount();
  });

  it('renders icon', () => {
    props.event.completed_steps_count = 1;
    props.event.due_at = new Date(now.getTime() + ( 18*60*60*1000 ));
    props.event.complete = false;
    const row = mount(<Row {...props} />);
    const t = props.event;
    expect(row.find('Col[className="feedback"]').text()).toEqual(`${t.complete_exercise_count}/${t.exercise_count} answered`);
    expect(row).toHaveRendered('Icon[type="exclamation-circle"]');

    props.event.due_at = new Date(now.getTime() - ( 36*60*60*1000 ));
    expect(row).toHaveRendered(`Icon[type="clock"][color="${Theme.colors.danger}"]`);

    props.event.accepted_late_at = new Date(now.getTime() - ( 48*60*60*1000 ));
    props.event.last_worked_at = props.event.accepted_late_at - 1;
    expect(row).toHaveRendered(`Icon[type="clock"][color="${Theme.colors.neutral.thin}"]`);

    row.unmount();
  });

});
