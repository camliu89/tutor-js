import React from 'react';
import { get } from 'lodash';
import { Provider, inject, observer, observable, computed } from '../../helpers/react';
import CourseNagModal        from '../../components/onboarding/course-nag';
import TermsModal            from '../../components/terms-modal';
import Courses               from '../../models/courses-map';
import Toasts                from 'shared/components/toasts';
import Router                from '../../helpers/router';
import TutorLink             from '../link';
import ServerErrorMonitoring from '../error-monitoring';
import ActionsMenu           from './actions-menu';
import UserMenu              from './user-menu';
import BookLinks             from './book-links';
import CenterControls        from './center-controls';
import PreviewAddCourseBtn   from './preview-add-course-btn';
import SupportMenu           from './support-menu';
import StudentPayNowBtn      from './student-pay-now-btn';
import PlugableNavBar        from './plugable';
import NavbarContext         from './context';
import onboardingForCourse   from '../../models/course/onboarding';

@inject((allStores, props) => ({ tourContext: ( props.tourContext || allStores.tourContext ) }))
@observer
class DefaultNavBar extends React.Component {


  static propTypes = {
    params: React.PropTypes.shape({
      courseId: React.PropTypes.string,
    }).isRequired,
    tourContext: React.PropTypes.object,
  }

  @observable courseOnboarding;

  componentWillMount() {
    if (!this.course) { return; }
    this.courseOnboarding = onboardingForCourse(this.course, this.props.tourContext);
    this.courseOnboarding.mount();
  }

  @computed get course() {
    const { params: { courseId } } = this.props;
    return courseId ? Courses.get(courseId) : null;
  }

  componentDidUpdate() {
    if (this.courseOnboarding) {
      this.courseOnboarding.course = this.course;
    }
  }

  componentWillUnmount() {
    if (this.courseOnboarding) { this.courseOnboarding.close(); } // courseOnboarding will tell context it's ok to display tours
  }

  render() {
    const { params, params: { courseId } } = this.props;

    return (
      <nav className="tutor-top-navbar">
        <div className="tutor-nav-controls">
          <div className="left-side-controls">
            <TutorLink to="myCourses" className="brand" aria-label="dashboard">
              <i className="ui-brand-logo" />
            </TutorLink>
            <BookLinks courseId={courseId} />
          </div>
          <CenterControls params={params} />
          <div className="right-side-controls">
            <SupportMenu         courseId={courseId} />
            <StudentPayNowBtn    courseId={courseId} />
            <ActionsMenu         courseId={courseId} />
            <PreviewAddCourseBtn courseId={courseId} />
            <UserMenu />
          </div>
        </div>
        <ServerErrorMonitoring />
        <TermsModal />
        <Toasts />
        <CourseNagModal ux={this.courseOnboarding} />
      </nav>
    );
  }

}

const NavBarTypes = {
  Plugable: PlugableNavBar,
  Default: DefaultNavBar,
};

class NavBarContextProvider extends React.Component {

  navBarContext = new NavbarContext();

  render() {
    return (
      <Provider navBar={this.navBarContext}>
        {this.props.children}
      </Provider>
    );
  }

}

export default {
  context: NavBarContextProvider,
  bar() {
    const settings = get(Router.currentMatch(), 'entry.settings');
    const params = Router.currentParams();
    const NavbarComponent = NavBarTypes[get(settings, 'navBar', 'Default')];
    return <NavbarComponent params={params} />;
  },
};
