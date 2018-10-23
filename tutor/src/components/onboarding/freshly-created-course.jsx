import MobxPropTypes from 'prop-types';
import React from 'react';
import { Button, Panel } from 'react-bootstrap';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { map, partial } from 'lodash';
import { OnboardingNag, Body, Footer } from './onboarding-nag';

export default
@observer
class FreshlyCreatedCourse extends React.Component {

  static propTypes = {
    ux: MobxPropTypes.observableObject.isRequired,
  }

  @action.bound
  onChoice(id) {
    this.props.ux.recordExpectedUse(id);
  }

  render() {
    return (
      <OnboardingNag className="freshly-created-course">
        <Body>
          <p>
            Now that you've created your OpenStax Tutor course, tell us how you plan to use it:
          </p>

          <Panel
            collapsible
            bsClass='why-ask'
            headerRole='button'
            header = "Why are you asking?"
          >
            OpenStax Tutor is funded by philanthropic foundations who want to know how their gifts
            impact student learning. Your confirmation helps us send accurate student numbers to our
            foundation supporters, helping to secure future funding.
          </Panel>

        </Body>
        <Footer>
          {map(this.props.ux.usageOptions, (txt, id) =>
            <Button
              key={id}
              onClick={partial(this.onChoice, id)}
            >
              {txt}
            </Button>)}
        </Footer>
      </OnboardingNag>
    );
  }
};
