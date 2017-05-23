import { observable } from 'mobx';
import { TEACHER_COURSE_TWO_MODEL } from '../../courses-test-data';
import Course from '../../../src/models/course';
import CoursePreviewUX from '../../../src/models/course/preview-ux';

let mockCourses = observable.array();
let mockActiveCoursePlans = observable.array();
jest.mock('../../../src/models/courses-map', () => ({
  get array(){ return mockCourses; },
}));
import { TimeStore } from '../../../src/flux/time';

jest.mock('../../../src/models/teacher-task-plans', () => ({
  forCourseId() {
    return {
      active: mockActiveCoursePlans,
    };
  },
}));

describe('Course Preview UX', () => {
  let ux;

  beforeEach(() => {
    ux = new CoursePreviewUX(new Course(TEACHER_COURSE_TWO_MODEL));
    ux._setTaskPlanPublish(false);
  });

  it('#shouldWarnPreviewOnly', () => {
    ux._setTaskPlanPublish();
    expect(ux.shouldWarnPreviewOnly).toBe(false);
    mockActiveCoursePlans.replace([
      { is_preview: true, type: 'homework' },
      { is_preview: false, type: 'homework' },
      { is_preview: true, type: 'reading' },
    ]);
    expect(ux.shouldWarnPreviewOnly).toBe(false);
    mockActiveCoursePlans.push({ is_preview: false, type: 'external' });
    expect(ux.shouldWarnPreviewOnly).toBe(false);
    mockActiveCoursePlans.push({ is_preview: false, type: 'reading' });
    expect(ux.shouldWarnPreviewOnly).toBe(true);
  });

  it('#hasCreatedRealCourse', () => {
    mockCourses.push({ is_preview: true });
    expect(ux.hasCreatedRealCourse).toBe(false);
    mockCourses.push({ is_preview: false });
    expect(ux.hasCreatedRealCourse).toBe(true);
  });

  it('#nagComponent', () => {
    mockCourses.clear();
    expect(ux.nagComponent).toBeNull();
    ux.course.ends_at = TimeStore.getNow() - 100;
    expect(ux.course.hasEnded).toBe(true);
    mockActiveCoursePlans.clear();
    expect(ux.nagComponent).not.toBeNull();
  });

});
