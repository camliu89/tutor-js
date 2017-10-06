import {
  identifiedBy, session,
} from '../base';

import moment from 'moment';
import { observable, computed } from 'mobx';
import Job from '../job';
import { UiSettings } from 'shared';
import { TimeStore } from '../../flux/time';

const CURRENT = observable.map();
const LAST_EXPORT = 'sce';

@identifiedBy('jobs/scores-export')
export default class ScoresExport extends Job {

  static forCourse(course) {
    let exp = CURRENT.get(course.id);
    if (!exp){
      exp = new ScoresExport(course);
      CURRENT.set(course.id, exp);
    }
    return exp;
  }

  @observable course;
  @session url;

  @computed get lastExportedAt() {
    const date = UiSettings.set(LAST_EXPORT, this.course.id);
    return date ? moment(date).format('M/D/YY, h:mma') : 'Never';
  }

  constructor(course) {
    super({ maxAttempts: 120, interval: 5 }); // every 5 seconds for max of 10 mins
    this.course = course;
  }

  onPollComplete() {
    UiSettings.set(LAST_EXPORT, this.course.id, TimeStore.getNow().toISOString());
  }

  create() { }

  onCreated({ data }) {
    this.startPolling(data.job);
  }

}