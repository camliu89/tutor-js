import PropTypes from 'prop-types';
import React from 'react';
import { Container } from 'react-bootstrap';
import BackButton from '../../components/buttons/back-button';
import Router from '../../helpers/router';
import { first, get } from 'lodash';
import CoursePeriodsNavShell from '../../components/course-periods-nav';
import CourseGroupingLabel from '../../components/course-grouping-label';
import * as PerformanceForecast from '../../flux/performance-forecast';
import TourRegion from '../../components/tours/region';

import Guide from './guide';
import ColorKey from './color-key';
import InfoLink from './info-link';

export default class extends React.Component {
  static displayName = 'PerformanceForecastTeacherDisplay';

  static propTypes = {
    courseId:  PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    const periods = PerformanceForecast.Teacher.store.get(props.courseId);
    this.state = { periodId: get(first(periods), 'period_id') };
  }

  selectPeriod = (period) => {
    return this.setState({ periodId: period.id });
  };

  renderEmptyMessage = () => {
    return (
      <div className="no-data-message">
        {`\
    There have been no questions worked for
    this `}
        <CourseGroupingLabel courseId={this.props.courseId} lowercase={true} />
        {'.\
    '}
      </div>
    );
  };

  renderHeading = () => {
    const periods = PerformanceForecast.Teacher.store.get(this.props.courseId);
    return (
      <div>
        <div className="guide-heading">
          <div className="guide-group-title">
            {'\
    Performance Forecast '}
            <InfoLink type="teacher" />
          </div>
          <div className="info">
            <div className="guide-group-key teacher">
              <ColorKey />
            </div>
            <BackButton
              fallbackLink={{ to: 'dashboard', text: 'Back to Dashboard', params: Router.currentParams() }} />
          </div>
        </div>
        <CoursePeriodsNavShell
          periods={periods}
          handleSelect={this.selectPeriod}
          intialActive={this.state.periodId}
          courseId={this.props.courseId} />
      </div>
    );
  };

  renderWeakerExplanation = () => {
    return (
      <div className="explanation">
        <p>
          {`\
    Tutor shows the weakest topics for
    each `}
          <CourseGroupingLabel courseId={this.props.courseId} lowercase={true} />
          {'.\
    '}
        </p>
        <p>
          Students may need your help in those areas.
        </p>
      </div>
    );
  };

  render() {
    const { courseId } = this.props;
    return (
      <Container className="performance-forecast teacher">
        <TourRegion id="performance-forecast">
          <Guide
            courseId={courseId}
            weakerTitle="Weaker Areas"
            heading={this.renderHeading()}
            weakerExplanation={this.renderWeakerExplanation()}
            weakerEmptyMessage="Your students haven't worked enough problems for Tutor to predict their weakest topics."
            emptyMessage={this.renderEmptyMessage()}
            allSections={PerformanceForecast.Teacher.store.getSectionsForPeriod(courseId, this.state.periodId)}
            chapters={PerformanceForecast.Teacher.store.getChaptersForPeriod(courseId, this.state.periodId)} />
        </TourRegion>
      </Container>
    );
  }
}
