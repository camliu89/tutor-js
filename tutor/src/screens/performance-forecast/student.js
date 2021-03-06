import PropTypes from 'prop-types';
import React from 'react';
import { Container } from 'react-bootstrap';
import BackButton from '../../components/buttons/back-button';
import Router from '../../helpers/router';
import * as PerformanceForecast from '../../flux/performance-forecast';

import Guide from './guide';
import ColorKey from './color-key';
import InfoLink from './info-link';

export default class extends React.Component {
  static displayName = 'PerformanceForecastStudentDisplay';

  static propTypes = {
    courseId:  PropTypes.string.isRequired,
  };

  renderEmptyMessage = () => {
    return (
      <div className="no-data-message">
        You have not worked any questions yet.
      </div>
    );
  };

  renderHeading = () => {
    return (
      <div className="guide-heading">
        <div className="guide-group-title">
          {'\
    Performance Forecast '}
          <InfoLink type="student" />
        </div>
        <div className="info">
          <div className="guide-group-key">
            <div className="guide-practice-message">
              Click on the bar to practice the topic
            </div>
            <ColorKey />
          </div>
          <BackButton
            fallbackLink={{ to: 'dashboard', text: 'Back to Dashboard', params: Router.currentParams() }} />
        </div>
      </div>
    );
  };

  renderWeakerExplanation = () => {
    return (
      <div className="explanation">
        <p>
          Tutor shows your weakest topics so you can practice to improve.
        </p>
        <p>
          Try to get all of your topics to green!
        </p>
      </div>
    );
  };

  render() {
    const { courseId } = this.props;

    return (
      <Container className="performance-forecast student">
        <Guide
          canPractice={true}
          courseId={courseId}
          weakerTitle="My Weaker Areas"
          weakerExplanation={this.renderWeakerExplanation()}
          weakerEmptyMessage="You haven't worked enough problems for Tutor to predict your weakest topics."
          heading={this.renderHeading()}
          emptyMessage={this.renderEmptyMessage()}
          allSections={PerformanceForecast.Student.store.getAllSections(courseId)}
          chapters={PerformanceForecast.Student.store.get(courseId).children} />
      </Container>
    );
  }
}
