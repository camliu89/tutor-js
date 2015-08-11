React = require 'react'
BS = require 'react-bootstrap'

ChapterSectionType = require './chapter-section-type'

module.exports = React.createClass
  displayName: 'LearningGuideProgressBar'

  propTypes:
    section:  React.PropTypes.object.isRequired
    onPractice: React.PropTypes.func

  render: ->
    {section, onPractice} = @props
    {clue} = section

    bar = if clue.sample_size_interpretation is 'below'
      <span className="no-data">
        {if onPractice then 'Practice more to get forecast' else 'Not enough exercises completed'}
      </span>
    else
      percent = Math.round((clue.value / 1) * 100)
      # always show at least 5% of bar, otherwise it just looks empty
      <BS.ProgressBar className={clue.value_interpretation} now={Math.max(percent, 5)} />

    if onPractice
      tooltip = <BS.Tooltip>Click to practice</BS.Tooltip>
      <BS.OverlayTrigger placement='bottom' overlay={tooltip}>
        <BS.Button onClick={-> onPractice(section)} block>{bar}</BS.Button>
      </BS.OverlayTrigger>
    else
      bar
