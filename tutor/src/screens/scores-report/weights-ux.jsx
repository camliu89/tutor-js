import { observable, computed, action } from 'mobx';
import { reduce, each } from 'lodash';

const CELL_AVERAGES_SINGLE_WIDTH = 80;

const DEFAULTS = {
  homework_scores: 100,
  homework_progress: 0,
  reading_scores: 0,
  reading_progress: 0,
};

const CW = {
  homework_score_weight: 'homework_scores',
  homework_progress_weight: 'homework_progress',
  reading_score_weight: 'reading_scores',
  reading_progress_weight: 'reading_progress',
};

export default class ScoresReportWeightsUX {

  @observable homework_scores;
  @observable homework_progress;
  @observable reading_scores;
  @observable reading_progress;

  @observable isSetting = false;

  constructor(scoresUx) {
    this.scoresUx = scoresUx;
  }

  @action.bound onSetClick() {
    const { course } = this;
    this.isSetting = true;
    each(CW, (w, c) => {
      this[w] = (course[c] || 0) * 100;
    });
  }

  @action.bound onCancelClick() {
    this.isSetting = false;
  }

  @action.bound onSaveWeights() {
    const { course } = this.scoresUx;
    each(CW, (w, c) => {
      course[c] = this[w] / 100;
    });
    course.save();
  }

  @computed get course() {
    return this.scoresUx.course;
  }

  @computed get isBusy() {
    return this.course.api.isPending;
  }

  @action.bound setWeight(ev) {
    this[ev.target.name] = parseInt(ev.target.value);
  }

  @computed get isValid() {
    return 100 === reduce(DEFAULTS, (ttl, v, attr) => this[attr] + ttl, 0);
  }

  @action.bound setDefaults() {
    Object.assign(this, DEFAULTS);
  }

}