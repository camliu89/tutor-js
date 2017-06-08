import { partial, get } from 'lodash';

import Router from '../helpers/router';
import Courses from '../models/courses-map';

// generate custom event data for routes
const Events = {
  viewTaskStep({ courseId }) {
    // track all work done on a course
    return Analytics.sendEvent('Course', 'Work', { label: courseId });
  },

  viewStudentDashboard({ courseId }) {
    // compare activity between courses
    return Analytics.sendEvent('Student', 'Dashboard', { label: courseId });
  },
};

// a bit shorter helper methods
const isTeacher = courseId => Courses.get(courseId).is_teacher;
const getRole = function(courseId) {
  if (Courses.get(courseId).is_teacher) { return 'teacher'; } else { return 'student'; }
};

const assignmentTypeTranslator = function(assignmentType, { courseId, id }) {
  const type = id === 'new' ? 'create' : 'edit';
  return `/teacher/assignment/${type}/${assignmentType}/${courseId}`;
};

// Translators convert a url like '/foo/bar/123/baz/1' into a simplified one like just '/foo/bar'
const Translators = {
  dashboard({ courseId }) {
    if (isTeacher(courseId)) { return `/teacher/calendar/${courseId}`; } else { return `/student/dashboard/${courseId}`; }
  },
  practiceTopics({ courseId }) { return `/student/practice/${courseId}`; },
  viewPerformanceGuide({ courseId }) {
    return `/${getRole(courseId)}/performance-forecast/${courseId}`;
  },
  calendarByDate({ courseId }) { return `/teacher/calendar/${courseId}`; },
  viewScores({ courseId }) { return `/teacher/student-scores/${courseId}`; },
  courseSettings({ courseId }) { return `/teacher/roster/${courseId}`; },
  editReading:    partial(assignmentTypeTranslator, 'reading'),
  editHomework:   partial(assignmentTypeTranslator, 'homework'),
  editExternal:   partial(assignmentTypeTranslator, 'external'),
  editEvent:      partial(assignmentTypeTranslator, 'event'),
  createReading:  partial(assignmentTypeTranslator, 'reading'),
  createHomework: partial(assignmentTypeTranslator, 'homework'),
  createExternal: partial(assignmentTypeTranslator, 'external'),
  createEvent:    partial(assignmentTypeTranslator, 'event'),
  calendarViewPlanStats({ courseId }) { return `/teacher/metrics/quick/${courseId}`; },
  reviewTask({ courseId }) { return `/teacher/metrics/review/${courseId}`; },
  viewReferenceBook({ courseId }) { return `/reference-view/${courseId}`; },
  viewReferenceBookSection({ courseId, section }) { return `/reference-view/${courseId}/section/${section}`; },
  viewReferenceBookPage({ courseId, cnxId }) { return `/reference-view/${courseId}/page/${cnxId}`; },

  // Task steps are viewed by both teacher and student with no difference in params
  viewTaskStep({ courseId }) {
    const role = Courses.get(courseId).primaryRole.type;
    return `/${role}/task-step/${courseId}`;
  },
};


let GA = undefined;
let trackerNames = undefined;

var Analytics = {

  // Set the Command Queue (ga) and cache the (possibly multiple) tracker names
  setGa(ga) {
    trackerNames = undefined;
    GA = ga;

    if (GA) {
      GA(function() {
        trackerNames = GA.getAll().map(function(tracker) { return tracker.get('name'); });
      });
    }

    return GA;
  },

  // Calls all trackers with the command and arguments given here
  ga() {
    if (!GA || !trackerNames) { return; }

    var params = Array.prototype.slice.call(arguments);
    var command = params.shift();
    var that = this;

    trackerNames.forEach(function(trackerName) {
      that.realGa(trackerName + '.' + command, ...params)
    });
  },

  // Exists largely for spec mocking
  realGa() {
    GA(arguments);
  },

  sendPageView(url) {
    this.ga('send', 'pageview', url);
  },

  onNavigation(path) {
    if (!GA) { return; }
    const route = Router.currentMatch(path);

    if (!route) { return this.sendPageView(`/not-found${path}`); }

    const translatedPath = Translators[route.entry.name] ?
          Translators[route.entry.name]( route.params ) : route.pathname;

    // if we're also going to send custom events then we set the page
    if (Events[route.entry.name]) {
      ga('set', 'page', translatedPath);
      Events[route.entry.name]( route.params );
      return this.sendPageView(); // url's not needed since it was set before events
    } else {
      return this.sendPageView(translatedPath);
    }
  },

  sendEvent(category, action, attrs) {
    ga('send', 'event', category, action, attrs.label, attrs.value);
  },
};

export default Analytics;