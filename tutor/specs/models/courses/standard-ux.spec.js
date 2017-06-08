import { observable } from 'mobx';
import { TEACHER_COURSE_TWO_MODEL } from '../../courses-test-data';
import Course from '../../../src/models/course';
import CourseUX from '../../../src/models/course/standard-ux';
import UiSettings from 'shared/src/model/ui-settings';
import User from '../../../src/models/user';

jest.mock('shared/src/model/ui-settings');
jest.mock('../../../src/models/user', ()=> ({
  logEvent: jest.fn(),
}));

describe('Course Preview UX', () => {
  let ux;

  beforeEach(() => {
    ux = new CourseUX({
      id: 1,
      dashboardViewCount: 0,
    });
  });

  it('#nagComponent', () => {
    expect(ux.nagComponent).toBeNull();
    ux.course.dashboardViewCount = 2;
    expect(ux.nagComponent).not.toBeNull();

    UiSettings.get.mockImplementation(() => 'dn');
    ux.course.dashboardViewCount = 12;
    expect(ux.isOnboardingUndecided).toBe(true);
    expect(ux.nagComponent).not.toBeNull();

    ux.responce = 'dn';
    expect(ux.nagComponent).not.toBeNull();

    UiSettings.get.mockImplementation(() => 'wu');
    expect(ux.nagComponent).toBeNull();
  });

  it('#recordExpectedUse(decision)', () => {
    ux.recordExpectedUse('wu');
    expect(User.logEvent).toHaveBeenCalledWith({
      category: 'onboarding', code: 'made_adoption_decision', data: { decision: 'I won\'t be using it' },
    });
    expect(UiSettings.set).toHaveBeenCalledWith('OBC', 1, 'wu');
  });

});