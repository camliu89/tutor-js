import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import { observer } from 'mobx-react';
import { computed, observable, action } from 'mobx';
import { first, find } from 'lodash';
import Courses from '../../models/courses-map';
import Breadcrumbs from './breadcrumbs';
import Stats from '../plan-stats';
import Review from './review';
import { PinnedHeaderFooterCard } from 'shared';
import ScrollTo from '../../helpers/scroll-to';
import { idType } from 'shared/helpers/react';
import NoStats from './no-stats';

@observer
export default class TaskTeacherReview extends React.Component {
  static propTypes = {
    id: React.PropTypes.string,
    params: React.PropTypes.shape({
      id: React.PropTypes.string,
      courseId: idType,
    }).isRequired,
    windowImpl: React.PropTypes.object,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  @computed get course() {
    return Courses.get(this.props.params.courseId);
  }

  @computed get taskPlan() {
    return this.course.taskPlans.withPlanId(this.props.params.id);
  }

  scroller = new ScrollTo({
    windowImpl: this.props.windowImpl,
  })

  @observable period = first(this.course.periods.sorted);

  @action.bound setPeriod(period) {
    this.period = period;
  }

  @computed get stats() {
    return find(this.taskPlan.analytics.stats, { period_id: this.period.id });
  }

  componentWillMount() {
    this.taskPlan.fetch().then(() =>
      this.taskPlan.analytics.fetchReview(),
    );
  }

  @action.bound scrollToStep(currentStep) {
    const stepSelector = `[data-section='${currentStep}']`;
    this.scroller.scrollToSelector(
      stepSelector, { updateHistory: false, unlessInView: false, scrollTopOffset: 180 },
    );
  }

  renderBreadcrumbs() {
    return (
      <Breadcrumbs
        stats={this.stats}
        taskPlan={this.taskPlan}
        courseId={this.course.id}
        goToStep={this.goToStep}
        scrollToStep={this.scrollToStep}
      />
    );
  }

  renderReviewPanel() {
    if (!this.stats) {
      return (
        <NoStats taskPlan={this.taskPlan} header={this.renderBreadcrumbs()} course={this.course} period={this.period} />
      );
    }
    return (
      <Review
        goToStep={this.goToStep}
        stats={this.stats}
        period={this.period} />
    );
  }

  render() {
    const { course, period, props: { params: { courseId } } } = this;

    return (
      <PinnedHeaderFooterCard
        className={`task-teacher-review task-${this.taskPlan.type}`}
        fixedOffset={0}
        header={this.renderBreadcrumbs()}
        cardType="task"
      >
        <Grid fluid={true} className="task-teacher-review">
          <Row>
            <Col sm={8}>
              {this.renderReviewPanel()}
            </Col>
            <Col sm={4}>
              <Stats
                plan={this.taskPlan}
                course={course}
                initialActivePeriodInfo={period}
                shouldOverflowData={true}
                handlePeriodSelect={this.setPeriod}
              />
            </Col>
          </Row>
        </Grid>
      </PinnedHeaderFooterCard>
    );
  }
}
