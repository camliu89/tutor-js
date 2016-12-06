React = require 'react'
moment = require 'moment-timezone'
BS = require 'react-bootstrap'
_ = require 'underscore'

LoadableItem = require '../loadable-item'
{TeacherTaskPlanStore, TeacherTaskPlanActions} = require '../../flux/teacher-task-plan'
{TaskPlanStore, TaskPlanActions} = require '../../flux/task-plan'
{CourseStore} = require '../../flux/course'
{CurrentUserStore} = require '../../flux/current-user'
{TimeStore} = require '../../flux/time'
TimeHelper = require '../../helpers/time'
CourseDataHelper = require '../../helpers/course-data'
PH = require '../../helpers/period'
CourseTitleBanner = require '../course-title-banner'
CourseCalendar = require '../course-calendar'
{NotificationsBar} = require 'shared'
NotificationHelpers = require '../../helpers/notifications'

getDisplayBounds =
  month: (date) ->
    startAt: TimeHelper.toISO(
      date.clone().startOf('month').startOf('week').subtract(1, 'day')
    )
    endAt: TimeHelper.toISO(
      date.clone().endOf('month').endOf('week').add(1, 'day')
    )

TeacherTaskPlans = React.createClass

  contextTypes:
    router: React.PropTypes.object

  propTypes:
    params: React.PropTypes.shape(
      courseId: React.PropTypes.string.isRequired
      date:     React.PropTypes.string
    ).isRequired

  onEditPlan: ->
    courseId = @props.params.courseId
    {plan} = @props
    {id, type} = plan
    if type is 'reading'
      @context.router.transitionTo("/courses/#{courseId}/editReading")
    else if type is 'homework'
      @context.router.transitionTo('editHomework', {courseId, id})

  onViewStats: ->
    courseId = @props.params.courseId
    {plan} = @props
    {id} = @props.plan

    @context.router.transitionTo('viewStats', {courseId, id})


  render: ->
    {plan} = @props
    start  = moment(plan.opens_at)
    ending = moment(plan.due_at)
    duration = moment.duration( ending.diff(start) ).humanize()

    <div className='-list-item'>
      <BS.ListGroupItem header={plan.title} onClick={@onEditPlan}>
        {start.fromNow()} ({duration})
      </BS.ListGroupItem>
      <BS.Button
        bsStyle='link'
        className='-tasks-list-stats-button'
        onClick={@onViewStats}>View Stats</BS.Button>
    </div>


TeacherTaskPlanListing = React.createClass

  displayName: 'TeacherTaskPlanListing'

  propTypes:
    dateFormat: React.PropTypes.string
    date: React.PropTypes.string

  getDefaultProps: ->
    dateFormat: TimeHelper.ISO_DATE_FORMAT

  getInitialState: ->
    startingState =
      displayAs: 'month'

  getDateStates: (state) ->
    term = CourseDataHelper.getCourseBounds(@props.params.courseId)
    courseDates = {termStart: term.start, termEnd: term.end}
    date = @getDateFromParams(courseDates)

    bounds = @getBoundsForDate(date, state)
    _.extend({date}, bounds, courseDates)

  getBoundsForDate: (date, state) ->
    state ?= @state

    {displayAs} = state

    getDisplayBounds[displayAs](date)

  componentWillMount: ->
    courseId = @props.params.courseId
    courseTimezone = CourseStore.getTimezone(courseId)
    TimeHelper.syncCourseTimezone(courseTimezone)

    TeacherTaskPlanActions.clearPendingClone(courseId)
    TaskPlanStore.on('saved.*', @loadToListing)

  componentWillUnmount: ->
    TimeHelper.unsyncCourseTimezone()

    TaskPlanStore.off('saved.*', @loadToListing)

  loadToListing: (plan) ->
    TeacherTaskPlanActions.addPublishingPlan(plan, @props.params.courseId)

  getBoundsForCourse: ->
    course = CourseStore.get(@props.params.courseId)

    termStart = TimeHelper.getMomentPreserveDate(course.starts_at, @props.dateFormat)
    termEnd = TimeHelper.getMomentPreserveDate(course.ends_at, @props.dateFormat)

    {termStart, termEnd}

  getDateFromParams: ({termStart, termEnd}) ->
    {date} = @props.params

    if date
      TimeHelper.getMomentPreserveDate(date, @props.dateFormat)
    else
      now = TimeHelper.getMomentPreserveDate(TimeStore.getNow(), @props.dateFormat)
      if termStart.isAfter(now) then termStart else now

  isLoadingOrLoad: ->
    courseId = @props.params.courseId
    {startAt, endAt} = @getDateStates()

    TeacherTaskPlanStore.isLoadingRange(courseId, startAt, endAt)

  loadRange: ->
    courseId = @props.params.courseId
    {startAt, endAt} = @getDateStates()

    TeacherTaskPlanActions.load(courseId, startAt, endAt)

  # router context is needed for Navbar helpers
  contextTypes:
    router: React.PropTypes.object

  render: ->
    {params} = @props

    {courseId} = params

    {displayAs} = @state
    {date, startAt, endAt, termStart, termEnd} = @getDateStates()

    course  = CourseStore.get(courseId)
    hasPeriods = PH.hasPeriods(course)

    loadPlansList = _.partial(TeacherTaskPlanStore.getActiveCoursePlans, courseId)
    loadedCalendarProps = {
      loadPlansList, courseId, date, displayAs, hasPeriods, params, termStart, termEnd
    }
    loadingCalendarProps = if hasPeriods
      _.extend(className: 'calendar-loading', loadedCalendarProps)
    else
      loadedCalendarProps

    <div className="list-task-plans">
      <NotificationsBar
        course={course}
        role={CurrentUserStore.getCourseRole(courseId)}
        callbacks={NotificationHelpers.buildCallbackHandlers(@)}
      />
      <CourseTitleBanner courseId={courseId} />
      <LoadableItem
        store={TeacherTaskPlanStore}
        actions={TeacherTaskPlanActions}
        load={@loadRange}
        options={{startAt, endAt}}
        id={courseId}
        isLoadingOrLoad={@isLoadingOrLoad}
        renderItem={-> <CourseCalendar {...loadedCalendarProps}/>}
        renderLoading={-> <CourseCalendar {...loadingCalendarProps}/>}
      />

    </div>

module.exports = TeacherTaskPlanListing
