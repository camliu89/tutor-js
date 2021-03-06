import PropTypes from 'prop-types';
import React from 'react';
import * as PerformanceForecast from '../../flux/performance-forecast';
import WeakerSections from './weaker-sections';
import PracticeWeakestButton from '../../components/buttons/practice-weakest';

// eslint-disable-next-line react/prefer-stateless-function
export default class WeakerPanel extends React.Component {
  static propTypes = {
    courseId:            PropTypes.string.isRequired,
    sections:            PropTypes.array.isRequired,
    weakerTitle:         PropTypes.string.isRequired,
    weakerExplanation:   PropTypes.node.isRequired,
    weakerEmptyMessage:  PropTypes.string.isRequired,
    canPractice:         PropTypes.bool,
    sectionCount:        PropTypes.number,
  };

  render() {
    // Do not render if we have no sections
    let practiceBtn;
    if (this.props.sections.length === 0) { return null; }
    // Only show the practice button if practice is allowed and weakest sections exit
    if (this.props.canPractice && PerformanceForecast.Helpers.canDisplayWeakest(this.props)) { practiceBtn =
      <PracticeWeakestButton title="Practice All" courseId={this.props.courseId} />; }

    return (
      <div className="chapter-panel weaker">
        <div className="chapter metric">
          <span className="title">
            {this.props.weakerTitle}
          </span>
          {this.props.weakerExplanation}
          {practiceBtn}
        </div>
        <WeakerSections {...this.props} />
      </div>
    );
  }
}
