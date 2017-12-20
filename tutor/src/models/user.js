import {
  BaseModel, identifiedBy, field, hasMany,
} from './base';
import { find, startsWith } from 'lodash';
import { action, computed, observable } from 'mobx';
import UiSettings from 'shared/src/model/ui-settings';
import Courses from './courses-map';
import { UserTerms } from './user/terms';
import Annotations from './annotations';
import lazyGetter from '../helpers/lazy-getter';
import ViewedTourStat from './user/viewed-tour-stat';
import { read_csrf } from '../helpers/dom';

@identifiedBy('user')
export class User extends BaseModel {

  @action.bound
  bootstrap(data) {
    this.update(data);
    this.csrf_token = read_csrf();
  }

  @observable csrf_token;

  @field account_uuid;

  @field name;
  @field self_reported_role;
  @field account_uuid;

  @field faculty_status;
  @field profile_url;

  @field is_admin;
  @field is_content_analyst;
  @field is_customer_service;
  @field terms_signatures_needed;

  @hasMany({ model: ViewedTourStat }) viewed_tour_stats;

  @computed get firstName() {
    return this.first_name || this.name ? this.name.replace(/ .*/, '') : '';
  }

  @computed get canAnnotate() {
    return !!find(Courses.nonPreview.active.array, { canAnnotate: true });
  }

  @computed get hasPreviewed() {
    return Courses.teaching.preview.any && Courses.teaching.preview.isViewed.any;
  }

  @computed get shouldPreview() {
    const exploreViewStats = this.viewed_tour_stats.find((stat) => stat.id === 'explore-a-preview');
    if (exploreViewStats) {
      return exploreViewStats.view_count < 4;
    }
    return true;
  }

  @lazyGetter annotations = new Annotations();

  @action removeCourse(course) {
    return Courses.delete(course.id);
  }

  @action refreshCourses() {
    return Courses.fetch();
  }

  @computed get isConfirmedFaculty() {
    return this.faculty_status === 'confirmed_faculty';
  }

  @computed get isProbablyTeacher() {
    return Boolean(this.isConfirmedFaculty || this.self_reported_role === 'instructor' || Courses.teaching.any);
  }

  @computed get terms() {
    return this.terms_signatures_needed ? new UserTerms({ user: this }) : null;
  }

  @computed get unsignedTerms() {
    return this.terms ? this.terms.unsigned : [];
  }

  @computed get tourAudienceTags() {
    let tags = [];
    if (
      (Courses.active.isEmpty && this.isConfirmedFaculty) ||
      Courses.active.teaching.nonPreview.any
    ) {
      tags.push('teacher');
    } else if (Courses.active.teaching.any) {
      tags.push('teacher-preview');
    }

    if (
      Courses.teaching.any &&
      this.hasPreviewed &&
      Courses.teaching.nonPreview.isEmpty
    ) {
      // Teacher has previewed a course but has no active real course.
      // This means the teacher needs a reminder about how to create a course.
      tags.push('teacher-need-real');
    } else if (find(tags, tag => startsWith(tag, 'teacher'))) {
      if (this.shouldPreview && !this.hasPreviewed) {
        // Otherwise, the teacher may need to preview a course
        tags.push('teacher-not-previewed');
      }
    }

    return tags;
  }

  resetTours() {
    this.viewed_tour_stats.clear();
  }

  replayTour(tour) {
    this.viewed_tour_stats.remove(find(this.viewed_tour_stats, { id: tour.id }));
  }

  viewedTour(tour, options) {
    let stats = this.viewed_tour_stats.find((stat) => stat.id === tour.id);

    if (stats) {
      stats.view_count ++;
    } else {
      stats = new ViewedTourStat({ id: tour.id });
      this.viewed_tour_stats.push(stats);
    }

    this.saveTourView(tour, options);
  }

  verifiedRoleForCourse(course) {
    return course.primaryRole && this.isConfirmedFaculty ? course.primaryRole.type : 'student';
  }

  saveTourView(tour, options) {
    return { data: options };
  }

  @computed get isUnverifiedInstructor() {
    return !this.isConfirmedFaculty && this.self_reported_role === 'instructor';
  }

  recordSessionStart() {
    UiSettings.set('sessionCount', this.sessionCount + 1);
  }

  get sessionCount() {
    return UiSettings.get('sessionCount') || 0;
  }

  logEvent({ category, code, data }) {
    // students do not track events
    if (this.self_reported_role === 'student') { return 'ABORT'; }
    return { category, code, data };
  }

}

const currentUser = new User;

export default currentUser;
