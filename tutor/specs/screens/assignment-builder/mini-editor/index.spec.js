import { React, Factory, TimeMock } from '../helpers';

import Editor from '../../../../src/screens/assignment-builder/mini-editor';

describe('TaskPlan MiniEditor wrapper', function() {
  let props = {};

  const now = TimeMock.setTo('2015-10-14T12:00:00.000Z');

  beforeEach(() => {
    const course = Factory.course();
    const sourcePlan = Factory.teacherTaskPlan({ now, course, type: 'homework', description: 'do this hw' });
    jest.spyOn(course, 'pastTaskPlans', 'get').mockImplementation(() => ({
      get() { return sourcePlan; },
      api: { hasBeenFetched: true },
    }));

    props = {
      course,
      sourcePlan: {
        id: String(sourcePlan.id),
        date: now,
      },
      findPopOverTarget: jest.fn(),
      onHide: jest.fn(),
      position: { x: 100, y: 100 },
    };
  });

  it('renders editor', () => {
    const wrapper = shallow(<Editor {...props} />);
    expect(wrapper).toHaveRendered('TaskPlanMiniEditor');
    wrapper.unmount();
  });
});
