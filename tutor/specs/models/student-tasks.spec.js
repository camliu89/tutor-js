import { Factory } from '../helpers';
import { StudentTask } from '../../src/models/student-tasks';

describe('Student Tasks Map', () => {
  let tasks;

  beforeEach(() => {
    tasks = Factory.studentTasks();
  });

  it('sets when getting unknown', () => {
    expect(tasks.has(892)).toBe(false);
    const st = tasks.get(892);
    expect(st).toBeInstanceOf(StudentTask);
    expect(tasks.get(892)).toBe(st);
  });

});
