_ = require 'underscore'
moment = require 'moment-timezone'

{makeSimpleStore, extendConfig} = require './helpers'
TimeHelper = require '../helpers/time'

getFromForTasking = (fromCollection, tasking) ->
  return fromCollection if _.isEmpty(tasking)

  fromCollection[toTaskingIndex(tasking)]

transformDefaultPeriod = (period) ->
  target_id: period.id
  target_type: 'period'
  open_time: period.default_open_time
  due_time: period.default_due_time

transformCourseToDefaults = (course) ->
  {periods, id} = course

  courseDefaults = _.chain(periods)
    .indexBy((period) ->
      "period#{period.id}"
    )
    .mapObject(transformDefaultPeriod)
    .value()

  courseDefaults.open_time = course.default_open_time
  courseDefaults.due_time = course.default_due_time

  courseDefaults

transformTasking = (tasking) ->
  transformed = _.pick(tasking, TASKING_IDENTIFIERS)

  transformed.open_time = TimeHelper.getTimeOnly(tasking.opens_at)
  transformed.due_time = TimeHelper.getTimeOnly(tasking.due_at)

  transformed.open_date = TimeHelper.getTimeOnly(tasking.opens_at)
  transformed.due_date = TimeHelper.getTimeOnly(tasking.due_at)

  transformed

transformTaskings = (taskings) ->
  _.chain(taskings)
    .indexBy(toTaskingIndex)
    .mapObject(transformTasking)
    .value()

maskToTasking = (tasking) ->
  masked = _.pick(tasking, TASKING_IDENTIFIERS)

  masked.opens_at = "#{tasking.open_date} #{tasking.open_time}"
  masked.due_at = "#{tasking.due_date} #{tasking.due_time}"

  masked

isTaskingValid = (tasking) ->
  TimeHelper.isDateTimeString(tasking.opens_at) and TimeHelper.isDateTimeString(tasking.due_at)

toTaskingIndex = (tasking) ->
  "#{tasking.target_type}#{tasking.target_id}"

# sample defaults
# "#{courseId}": {
#   "open_time": "00:01"
#   "due_time": "22:00",
#   "#{target_type}#{target_id}": {
#     "open_time": "00:01"
#     "due_time": "11:00"
#   },
#   "#{target_type}#{target_id}": {
#     "open_time": "00:01"
#     "due_time": "11:00"
#   }
# }

TaskingConfig =
  _defaults: {}
  _taskings: {}
  _tasksToCourse: {}

  loadDefaults: (courseId, course) ->
    @_defaults[courseId] = transformCourseToDefaults(course)
    @emit("defaults.#{courseId}.loaded")
    true

  loadTaskings: (taskId, courseId, taskings) ->
    @_taskings[taskId] = transformTaskings(taskings)
    @_tasksToCourse[taskId] = courseId
    @emit("taskings.#{taskId}.all.loaded")
    true

  updateTime: (taskId, tasking, timeString, type) ->
    taskingIndex = toTaskingIndex(tasking)
    timeString = TimeHelper.getTimeOnly(timeString)
    return false unless @_taskings[taskId][taskingIndex]? and timeString?

    @_taskings[taskId][taskingIndex]["#{type}_time"] = timeString
    true

  updateDate: (taskId, tasking, dateString, type) ->
    taskingIndex = toTaskingIndex(tasking)
    dateString = TimeHelper.getDateOnly(dateString)
    return false unless @_taskings[taskId][taskingIndex]? and dateString?

    @_taskings[taskId][taskingIndex]["#{type}_date"] = dateString
    true

  updateTasking: (taskId, tasking) ->
    taskingIndex = toTaskingIndex(tasking)
    return false unless @_taskings[taskId][taskingIndex]?

    @_taskings[taskId][taskingIndex] = transformTasking(tasking)
    true

  updateAllDates: (taskId, timeString, type) ->
    dateString = TimeHelper.getDateOnly(dateString)
    return false unless @_taskings[taskId]? and dateString?

    _.each @_taskings[taskId], (tasking) ->
      tasking["#{type}_date"] = dateString
    true

  updateAllTimes: (taskId, timeString, type) ->
    timeString = TimeHelper.getTimeOnly(timeString)
    return false unless @_taskings[taskId]? and timeString?

    _.each @_taskings[taskId], (tasking) ->
      tasking["#{type}_time"] = timeString
    true

  updateAllTaskings: (taskId, tasking) ->
    return false unless @_taskings[taskId]?

    _.each @_taskings[taskId], (prevTasking, taskingIndex) =>
      @_taskings[taskId][taskingIndex] = tasking
    true

  initializeTaskingsToDefaultTimes: (taskId, dates = {open_date: '', due_date: ''}) ->
    courseId = @exports.getCourseIdForTask.call(@, taskId)
    taskings = @exports.getTaskingDefaults.call(@, courseId)

    defaultToCourse = @exports.areDefaultTaskingTimesSame.call(@, courseId)

    default = @exports.getDefaultsFor.call(@, courseId) if defaultToCourse
    @_taskings[taskId] ?= {}

    _.each taskings, (tasking) =>
      default = @exports.getDefaultsFor.call(@, courseId, tasking) unless defaultToCourse
      taskingIndex = toTaskingIndex(tasking)

      @_taskings[taskId][taskingIndex] = _.extend({}, dates, default)

    true

  exports:
    getDefaults: (courseId) ->
      @_defaults[courseId]

    getTaskingDefaults: (courseId) ->
      defaults = @exports.getDefaults.call(@, courseId)
      _.omit(defaults, 'open_time', 'due_time')

    getDefaultsFor: (courseId, tasking) ->
      defaults = @exports.getDefaults.call(@, courseId)
      default = getFromForTasking(defaults, tasking)
      _.pick(default, 'open_time', 'due_time')

    areDefaultTaskingTimesSame: (courseId) ->
      defaults = @exports.getTaskingDefaults.call(@, courseId)
      firstDefault = _.chain(defaults)
        .values()
        .first()
        .pick('open_time', 'due_time')
        .value()

      _.every defaults, (default) ->
        _.isEqual(firstDefault, _.pick(default, 'opens_time', 'due_time'))

    _getTaskings: (taskId) ->
      @_taskings[taskId]

    getTaskings: (taskId) ->
      storedTaskings = @exports._getTaskings.call(@, taskId)

      taskings = _.map storedTaskings, maskToTasking

    _getTaskingFor: (taskId, tasking) ->
      storedTaskings = @exports._getTaskings.call(@, taskId)
      tasking = getFromForTasking(storedTaskings, tasking)

    getTaskingFor: (taskId, tasking) ->
      tasking = @exports._getTaskingFor.call(@, taskId, tasking)
      maskToTasking(tasking)

    getCourseIdForTask: (taskId) ->
      @_tasksToCourse[taskId]

    areTaskingsValid: (taskId) ->
      storedTaskings = @exports._getTaskings.call(@, taskId)
      _.every storedTaskings, isTaskingValid

    isTaskingValid: (taskId, tasking) ->
      tasking = @exports.getTaskingFor.call(@, taskId, tasking)
      isTaskingValid(tasking)

    isTaskingDefaultTime: (taskId, tasking, type = 'open') ->
      courseId = @exports.getCourseIdForTask.call(@, taskId)

      tasking = @exports.getTaskingFor.call(@, taskId, tasking)
      defaults = @exports.getDefaultsFor.call(@, courseId, tasking)

      tasking["#{type}_time"] is defaults["#{type}_time"]

    hasTasking: (taskId, tasking) ->
    hasAllTaskings: (taskId, tasking) ->
    hasAnyTasking: (taskId, tasking) ->
    getCommonDateTime: (taskId) ->
      taskings = @exports.getTaskings(taskId)
      firstTasking = _.chain(taskings)
        .values()
        .first()
        .pick('opens_at', 'due_at')
        .value()

      hasCommon = _.every taskings, (tasking) ->
        _.isEqual(firstTasking, _.pick(tasking, 'opens_at', 'due_at'))

      return firstTasking if hasCommon
      return false

    getTaskingDate: (taskId, tasking, type = 'open') ->
      tasking = @exports._getTaskingFor.call(@, taskId, tasking)
      tasking["#{type}_date"]

    getTaskingTime: (taskId, tasking, type = 'open') ->
      tasking = @exports._getTaskingFor.call(@, taskId, tasking)
      tasking["#{type}_time"]
