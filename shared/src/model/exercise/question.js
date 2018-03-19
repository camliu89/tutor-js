import { get, first, map, keys, each, find, reduce, isEmpty, without } from 'lodash';
import {
  BaseModel, identifiedBy, identifier, field, hasMany, computed, action,
} from '../../model';
import Answer from './answer';
import Solution from './solution';
import Format from './format';
import invariant from 'invariant';

@identifiedBy('exercise/question')
export default class ExerciseQuestion extends BaseModel {

  static FORMAT_TYPES = {
    'multiple-choice' : 'Multiple Choice',
    'true-false'      : 'True/False',
  };

  @identifier id;
  @field is_answer_order_important = false;
  @field stem_html;
  @field stimulus_html;
  @field({ type: 'array' }) hints;
  @hasMany({ model: Format, inverseOf: 'quesetion' }) formats;
  @hasMany({ model: Answer, inverseOf: 'question' }) answers;
  @hasMany({ model: Solution, inverseOf: 'question' }) collaborator_solutions;

  @computed get isMultipleChoice() {
    return this.hasFormat('multiple-choice');
  }

  hasFormat(value) {
    return Boolean(find(this.formats, { value }));
  }

  // @computed get formatType() {
  //   return get(this.formats, '[0].asString');
  // }

  set uniqueFormatType(type) {
    if (this.formats.length) {

      this.formats[0].value;
    } else {
      this.formats.push(new Format(type));
    }
  }

  @computed get solution_html() {
    get(first(this.collaborator_solutions, 'content_html'), '');
  }

  @computed get requiresChoicesFormat() {
    return !this.hasFormat('free-response');
  }

  @action setExclusiveFormat(name) {
    let formats = without(map(this.formats, 'value'), ...keys(ExerciseQuestion.FORMAT_TYPES));
    formats.push(name);
    if ('true-false' === name) {
      formats = without(formats, 'free-response');
    } else if ('multiple-choice' === name) {
      formats = formats.concat('free-response');
    }
    this.formats = formats;
  }

  @action toggleFormat(value, selected) {
    invariant(!ExerciseQuestion.FORMAT_TYPES[value], 'cannot toggle exclusive formats');

    if (selected && !this.hasFormat(value)) {
      this.formats.push(value);
    } else if (!selected) {
      this.formats.remove(find(this.formats, { value }));
    }
  }


  @computed get validity() {
    if (isEmpty(this.stem_html)){
      return { valid: false, part: 'Question Stem' };
    }

    return reduce(this.answers, (memo, answer) => ({
      valid: memo.valid && answer.validity.valid,
      part: memo.part || answer.validity.part,
    }) , { valid: true });
  }

  @action setCorrectAnswer(correctAnswer) {
    this.answers.forEach((a) => { a.correctness = ( (a === correctAnswer) ? '1.0' : '0.0' ); });
  }

  @action moveAnswer(answer, offset) {
    const index = this.answers.indexOf(answer);
    if (index != -1 && inRange(index+offset, 0, this.answers.length-1) {
        this.answers.splice(index+offset, 0, this.answers.splice(index, 1)[0]);
    }

  }

}
