import MobxPropTypes from 'prop-types';
import React from 'react';
import { Button } from 'react-bootstrap';
import { observer } from 'mobx-react';
import { OnboardingNag, Heading, Body, Footer } from './onboarding-nag';
import CourseUX from '../../models/course/ux';

export default
@observer
class FreeTrialActivated extends React.Component {

  static propTypes = {
    ux: MobxPropTypes.observableObject.isRequired,
  }

  static className = 'free-trial-activated';

  render() {
    const { ux } = this.props;

    return (
      <OnboardingNag className={this.constructor.className}>
        <Heading>
          Your free trial is activated!
        </Heading>

        <Body>
          <p>You will have access to {ux.course.name} for 14 days.</p>
          <p>
            To continue accessing your course beyond your trial period, click
            the Pay Now button on your OpenStax Tutor Beta dashboard and
            enter your one-time {CourseUX.formattedStudentCost} payment for the semester
          </p>
        </Body>

        <Footer>
          <Button bsStyle="primary" className="now" onClick={ux.onAccessCourse}>
            Access your course
          </Button>
        </Footer>

      </OnboardingNag>
    );
  }
};
