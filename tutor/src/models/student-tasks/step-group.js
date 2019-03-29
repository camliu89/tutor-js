import {
  BaseModel, identifiedBy, identifier, hasMany, computed,
} from 'shared/model';
import StudentTaskStep from './step';
import { readonly } from 'core-decorators';

export default
@identifiedBy('student-tasks/step-group')
class StudentTaskStepGroup extends BaseModel {

  @identifier uid;
  @hasMany({ model: StudentTaskStep }) steps;

  @readonly type = 'mpq';

  constructor(attrs) {
    super(attrs);
    this.steps.forEach((s) => s.multiPartGroup = this);
  }

  @computed get needsFetched() {
    return Boolean(this.steps.find(s => s.needsFetched));
  }

  getStepAfter(step) {
    const indx = this.steps.indexOf(step);
    if (indx != -1 && indx < this.steps.length - 1) {
      return this.steps[indx + 1];
    }
    return null;
  }

  fetchIfNeeded() {
    return this.steps.map(s => s.fetchIfNeeded());
  }

}
