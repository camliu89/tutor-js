import qs from 'qs';
import { omitBy, isUndefined } from 'lodash';

// This list maps Tutor book UUID's to the their official OpenStax title.
// It's used to pre-fill the errata submission form on webview with
// the correct book title, which requires an exact title match
import { BOOK_UID_XREF } from './book-uuid-xrefs';

const Exercises = {

  troubleUrl({ bookUUID, project, exerciseId, chapter_section, title }) {
    const location = [];
    if (exerciseId) { location.push(exerciseId); }
    if (chapter_section) {
      location.push(chapter_section.toString());
    }

    if (title) { location.push(title); }

    const locationString = location.join(' ');

    const urlParams = {
      source: project, // either tutor or CC
      location: locationString,
      book: BOOK_UID_XREF[bookUUID],
    };

    return Exercises.ERRATA_FORM_URL + '?' + qs.stringify(omitBy(urlParams, isUndefined));
  },

  getParts(exercise) {
    return (exercise.content != null ? exercise.content.questions : undefined) || [];
  },
};


Exercises.ERRATA_FORM_URL = 'https://openstax.org/errata/form';
Exercises.setOSWebURL = (url) => {
  if (url) { Exercises.ERRATA_FORM_URL = `${url}/errata/form`; }
};

export default Exercises;
