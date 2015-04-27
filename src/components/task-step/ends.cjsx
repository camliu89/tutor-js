React = require 'react'
BS = require 'react-bootstrap'
Router = require 'react-router'

PracticeButton = require '../practice-button'

PracticeEnd = React.createClass
  render: ->
    footer =
      <div>
        <PracticeButton
          courseId={@props.courseId}
          loadedTaskId={@props.taskId}
          reloadPractice={@props.reloadPractice}
          forceCreate={true}
          >Do more practice</PracticeButton>
        <Router.Link to="dashboard" className="btn btn-primary">Back to Dashboard</Router.Link>
      </div>

    <div className="task task-completed">
      {@props.breadcrumbs}
      <BS.Panel bsStyle="default" footer={footer} className='-practice-completed'>
        <h1>You earned a star!</h1>
        <h3>Great Job!</h3>
      </BS.Panel>
    </div>

HomeworkEnd = React.createClass
  render: ->
    footer = <Router.Link to="dashboard" className="btn btn-primary">Back to Dashboard</Router.Link>

    <div className="task task-completed">
      {@props.breadcrumbs}
      <BS.Panel bsStyle="default" footer={footer} className='-homework-completed'>
        <h3>Your homework will be automatically turned in at the due date.</h3>
      </BS.Panel>
    </div>

TaskEnd = React.createClass
  render: ->
    footer = <Router.Link to="dashboard" className="btn btn-primary">Back to Dashboard</Router.Link>

    <div className="task task-completed">
      {@props.breadcrumbs}
      <BS.Panel bsStyle="default" footer={footer} className="-reading-completed">
        <h1>You Are Done.</h1>
        <h3>Great Job!</h3>
      </BS.Panel>
    </div>

ends = {task: TaskEnd, homework: HomeworkEnd, practice: PracticeEnd, reading: TaskEnd}

module.exports =
  get: (type) ->
    ends[type] or TaskEnd
