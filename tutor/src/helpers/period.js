import S from './string';
import { filter, isEmpty, sortBy, toNumber } from 'lodash';

// Used to filter periods by helper methods
const isArchivedCheckFn = period => period.is_archived;
const isActiveCheckFn   = period => !period.is_archived;

const NumberLike = /[^0-9]+/;

const PeriodHelper = {
  getOrder(period) {
    return S.getNumberAndStringOrder(period.name);
  },

  sort(periods) {
    // expects either numbers, names with numbers or just names
    return sortBy(periods, (period) =>
                  NumberLike.test(period.name) ? toNumber(period.name) : period.name
                 );
  },

  activePeriods(course) {
    return filter(course.periods, isActiveCheckFn);
  },

  hasPeriods(course) {
    return !isEmpty(this.activePeriods(course));
  },

  archivedPeriods(course) {
    return filter(course.periods, isArchivedCheckFn);
  },
};

export default PeriodHelper;
