import { now as getNow } from 'mobx-utils';
import { isDate } from 'lodash';

let shiftMs = 0;
const defaultResolution = 1000 * 60; // one minute resolution
let timeResolution = defaultResolution;

export function setNow(now) {
  if (!isDate(now)) {
    now = new Date(now);
  }
  shiftMs = now.getTime() - (new Date()).getTime();
}

export function setResolution(r = defaultResolution) {
  timeResolution = r;
}

const Store = {

  DATE_FORMAT: 'MM/DD/YYYY',

  get now() {
    const now = getNow(timeResolution);
    return new Date(now + shiftMs);
  },

};

export default Store;
