import { pickBy, invoke, each, isFunction, get } from 'lodash';
import { observable } from 'mobx';

import User from '../user';
import Courses from '../courses-map';
import Payments from '../payments';

const ROUTES = {

  myCourses: {
    label: 'My Courses',
    locked(course) { return get(course, 'currentRole.isTeacherStudent'); },
    isAllowed(course) { return !!course; },
    params: () => undefined,
    options: {
      separator: 'after',
    },
  },
  dashboard: {
    label: 'Dashboard',
    isAllowed(course) { return !!course; },
  },
  browseBook: {
    label: 'Browse the Book',
    isAllowed(course) { return !!course; },
  },
  studentScores: {
    label: 'Scores',
    roles: {
      student: 'viewScores',
    },
  },
  guide: {
    label: 'Performance Forecast',
    isAllowed(course) { return get(course, 'is_concept_coach') !== true; },
    roles: {
      student: 'viewPerformanceGuide',
      teacher: 'viewPerformanceGuide',
    },
  },
  questions: {
    label: 'Question Library',
    roles: {
      teacher: 'viewQuestionsLibrary',
    },
  },
  scores: {
    label: 'Student Scores',
    roles: {
      teacher: 'viewScores',
    },
  },
  courseSettings: {
    label: 'Course Settings',
    roles: {
      teacher: 'courseSettings',
    },
  },
  courseRoster: {
    label: 'Course Roster',
    roles: {
      teacher: 'courseRoster',
    },
  },
  get_started: {
    label: 'Getting Started',
    isAllowed(course) { return get(course, 'is_concept_coach') === true; },
    roles: {
      teacher: 'ccDashboardHelp',
    },
  },
  changeId: {
    label: 'Change Student ID',
    roles: {
      student: 'changeStudentId',
    },
  },
  createNewCourse: {
    label: 'Create a Course',
    isAllowed() { return User.isCollegeTeacher; },
    options({ course }) {
      return course ? { separator: 'before' } : { separator: 'both' };
    },
  },
  cloneCourse: {
    label: 'Copy this Course',
    params({ courseId }) {
      return { sourceId: courseId };
    },
    roles: {
      teacher: 'createNewCourse',
    },
    options: {
      key: 'clone-course', separator: 'after',
    },
    isAllowed(course) {
      return !!(course && !course.is_preview && !course.is_concept_coach && User.isCollegeTeacher); },
  },
  customer_service: {
    label: 'Customer Service',
    href: '/customer_service',
    isAllowed() { return !!User.is_customer_service; },
  },
  admin: {
    label: 'Admin',
    href: '/admin',
    isAllowed() { return !!User.is_admin; },
  },
  QADashboard: {
    label: 'QA Dashboard',
    isAllowed() { return !!User.is_content_analyst; },
  },
  managePayments: {
    label: 'Manage payments',
    locked(course) { console.log(course); return get(course, 'currentRole.isTeacherStudent'); },
    isAllowed(course) { return this.locked(course) || Payments.config.is_enabled && Courses.costing.student.any; },
  },
  qaHome: {
    label: 'Content Analyst',
    href: '/content_analyst',
    isAllowed() { return !!User.is_content_analyst; },
  },

};

const TUTOR_HELP = 'https://openstax.secure.force.com/help';
const TUTOR_CONTACT = 'https://openstax.org/contact';
const SUPPORT_EMAIL = 'support@openstax.org';

function getRouteByRole(routeName, menuRole) {
  if (!ROUTES[routeName].roles) { return routeName; }
  return ROUTES[routeName].roles[menuRole];
}

function addRouteProperty(route, property, rules, options, defaults) {
  let value;
  if (isFunction(rules[property])) {
    value = rules[property](options);
  } else {
    value = rules[property] || defaults;
  }
  if (value) {
    route[property] = value;
  }
}


const UserMenu = observable({

  get helpURL() {
    return TUTOR_HELP;
  },

  get supportEmail() {
    return SUPPORT_EMAIL;
  },

  helpLinkForCourse(course) {
    if (!course) { return this.helpURL; }
    return TUTOR_HELP;
  },

  getRoutes(course) {
    let isTeacher = false, menuRole, courseId;

    if (course) {
      courseId = course.id;
      ({ isTeacher, primaryRole: { type: menuRole } } = course);
    }
    const options = { courseId: courseId, menuRole };
    const validRoutes = pickBy(
      ROUTES, (route, routeName) =>
        (invoke(route, 'isAllowed', course) !== false) &&
        (!route.isTeacher || isTeacher) &&
        getRouteByRole(routeName, menuRole)
    );
    const routes = [];

    each(validRoutes, (routeRules, routeName) => {
      const name = getRouteByRole(routeName, menuRole);
      const route = { name };
      if (routeRules.href){ route.href = routeRules.href; }
      addRouteProperty(route, 'locked', routeRules, course);
      addRouteProperty(route, 'options', routeRules, options);
      addRouteProperty(route, 'params', routeRules, options, course ? { courseId } : null);
      addRouteProperty(route, 'label', routeRules, options);
      routes.push(route);
    });
    return routes;
  },

});

export default UserMenu;
