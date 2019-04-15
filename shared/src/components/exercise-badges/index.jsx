import PropTypes from 'prop-types';
import React from 'react';
import Icon from '../icon';
import { map, compact } from 'lodash';
import Interactive from './interactive-icon';
import MultiPart from './multipart-icon';
import classnames from 'classnames';


const BADGES = {
  multiPart: (
    <span key="mpq" className="mpq">
      <MultiPart />
      <span>
        Multi-part question
      </span>
    </span>
  ),
  interactive: (
    <span key="interactive" className="interactive">
      <Interactive />
      <span>
        Interactive
      </span>
    </span>
  ),
  video: (
    <span key="video" className="video">
      <Interactive />
      <span>
        Video
      </span>
    </span>
  ),
  personalized: (
    <span key="personalized" className="personalized">
      <i className="icon icon-sm icon-personalized" />
      <span>
        Personalized
      </span>
      <Icon
        type="info-circle"
        tooltip="Personalized questions are choosen specifically for you by Tutor based on your learning history" />
    </span>
  ),
};

export default
function ExerciseBadges({ className, ...badgeProps }) {
  const badges = compact(map(badgeProps, (wants, type) => wants && BADGES[type]));

  if (!badges.length) { return null; }

  return (
    <div
      className={classnames('openstax-exercise-badges', className)}
    >
      {badges}
    </div>
  );

}

ExerciseBadges.propTypes = {
  className:    PropTypes.string,
  personalized: PropTypes.bool,
  interactive:  PropTypes.bool,
  multiPart:    PropTypes.bool,
  video:        PropTypes.bool,
};
