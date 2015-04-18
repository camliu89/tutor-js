React = require 'react'
_ = require 'underscore'
BS = require 'react-bootstrap'
Router = require 'react-router'

{TaskPlanStore, TaskPlanActions} = require '../../flux/task-plan'
LoadableItem = require '../loadable-item'

Stats = React.createClass
  percent: (num,total) ->
    Math.round((num/total) * 100)

  percentDelta: (a,b) ->
    if a > b
      change = a - b
      op = '+'
    else if a == b
      change = 0
      op = ''
    else
      change = b - a
      op = '-'
    op + ' ' + Math.round((change / b) * 100)

  percentCorrect: (data) ->
    total_count = data.correct_count+data.incorrect_count
    if total_count then @percent(data.correct_count, total_count) else 0

  renderPercentCorrectBar: (data, type) ->
    percentCorrect = @percentCorrect(data)
    classes = 'reading-progress-bar'
    classes += ' no-progress' unless percentCorrect
    correct = <BS.ProgressBar className={classes} bsStyle="success" label="%(percent)s%" now={percentCorrect} key="page-progress-#{type}-#{data.page.id}" />

  renderProgressBar: (data, type, index, previous) ->
    studentCount = if type is 'practice' then <span className='reading-progress-student-count'>({data.student_count} students)</span>

    <div key="#{type}-bar-#{index}">
      <div className="reading-progress-heading">
        {data.page.number} {data.page.title} {studentCount}
      </div>
      <div className="reading-progress-container">
        <BS.ProgressBar className="reading-progress-group">
          {@renderPercentCorrectBar(data, type)}
        </BS.ProgressBar>
        {previous}
      </div>
    </div>

  renderCourseBar: (data) ->
    <BS.Grid className="data-container" key="course-bar">
      <BS.Row>
        <BS.Col xs={4}>
          <label>Complete</label>
          <div className = 'data-container-value text-complete'>
            {data.complete_count}
          </div>
        </BS.Col>
        <BS.Col xs={4}>
          <label>In Progress</label>
          <div className = 'data-container-value text-in-progress'>
            {data.partially_complete_count}
          </div>
        </BS.Col>
        <BS.Col xs={4}>
          <label>Not Started</label>
          <div className = 'data-container-value text-not-started'>
            {data.total_count - (data.complete_count + data.partially_complete_count)}
          </div>
        </BS.Col>
      </BS.Row>
    </BS.Grid>

  renderChapterBars: (data, i) ->
    @renderProgressBar(data, 'chapter', i)

  renderPracticeBars: (data, i) ->
    if data.previous_attempt
      previous = <div className="reading-progress-delta">{@percentDelta(data.correct_count,data.previous_attempt.correct_count)}% change</div>
    @renderProgressBar(data, 'practice', i, previous)

  render: ->
    {id} = @props

    plan = TaskPlanStore.get(id)
    course = @renderCourseBar(plan.stats.course)
    chapters = _.map(plan.stats.course.current_pages, @renderChapterBars)
    practice = _.map(plan.stats.course.spaced_pages, @renderPracticeBars)

    if _.isEmpty(chapters)
      chapters = <p className='reading-stats-none'>No Chapter Progress</p>

    if _.isEmpty(practice)
      practice = <p className='reading-stats-none'>No Chapter Progress</p>


    <BS.Panel className="reading-stats">
      <section>
        {course}
      </section>
      <section>
        {chapters}
      </section>
      <section>
        <label>Space Practice Performance</label>
        {practice}
      </section>
    </BS.Panel>

StatsShell = React.createClass
  contextTypes:
    router: React.PropTypes.func

  getId: -> @context.router.getCurrentParams().id

  render: ->
    id = @getId()
    <LoadableItem
      id={id}
      store={TaskPlanStore}
      actions={TaskPlanActions}
      renderItem={=> <Stats id={id} />}
    />


module.exports = {StatsShell, Stats}
