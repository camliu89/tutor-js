import { without, findIndex, forEach } from 'lodash';
import { insert } from '../../helpers/immutable';
import UiSettings from 'shared/model/ui-settings';
import InfoStep from '../../models/student-tasks/info-step';

function insertBeforeMatch(type, task, steps, match) {
  const cleanSteps = without(steps, { type });
  const index = findIndex(cleanSteps, match);
  if (-1 !== index) {
    return insert(cleanSteps, index, new InfoStep({ task, type }));
  }
  return steps;
}

// spaced practice questions are preceded by a "Spaced Practice" card.
export function insertIndividiualReview({ steps, task, ...rest }) {
  return {
    ...rest,
    task,
    steps: insertBeforeMatch('individual-review-intro', task, steps, { isReview: true }),
  };
}

export function insertValueProp({ steps, task, ...rest }) {
  forEach({
    'personalized-intro':    { isPersonalized: true },
    'two-step-intro':        { isTwoStep: true },
    'spaced-practice-intro': { isSpacedPractice: true },
  }, (check, key) => {
    if (!UiSettings.get(`has-viewed-${key}`)) {
      steps = insertBeforeMatch(key, task, steps, check);
    }
  });
  return { steps, task, ...rest };
}

export function insertEnd({ steps, task, ...rest }) {
  if (task.isPractice || task.isHomework || task.isReading) {
    steps = without(steps, { type: 'end' });
    return {
      task,
      ...rest,
      steps: [...steps, new InfoStep({ task, type: 'end' })],
    };
  }
  return { steps, task, ...rest };
}
