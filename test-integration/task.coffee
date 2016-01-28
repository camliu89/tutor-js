{describe, CourseSelect, Task, User} = require './helpers'
{expect} = require 'chai'
_ = require 'underscore'
selenium = require 'selenium-webdriver'

{TaskHelper} = Task

STUDENT_USERNAME = 'student01'


describe 'Student performing tasks', ->

  beforeEach ->
    new User(@, STUDENT_USERNAME).login()
    @task = new TaskHelper(@)

  @it 'Can continue and go to expected steps (readonly)', ->

    _.each ['BIOLOGY', 'PHYSICS'], (courseCategory) =>
      appearance = courseCategory.toLowerCase()
      @utils.wait.click(css: "[data-appearance='#{appearance}'] > [href*='list']")
      @utils.wait.click(css: '.workable.task')

      @task.waitUntilLoaded(2000)
      @task.getEnabledContinueButton().click()
      @task.getEnabledContinueButton().click()
      # get multiple seems to not be working right now.
      # @task.getStepCrumbs(4).then (crumb) ->
      #   crumb.click()

      # Go back to the course selection
      @utils.wait.click(css: '.navbar-brand')


  @it 'Can continue (readonly)', ->

    _.each ['BIOLOGY', 'PHYSICS'], (courseCategory) =>
      appearance = courseCategory.toLowerCase()
      @utils.wait.click(css: "[data-appearance='#{appearance}'] > [href*='list']")

      @utils.wait.click(css: '.workable.task')

      @task.waitUntilLoaded(2000)
      @task.continue()
      @task.continue()
      @task.continue()
      @task.continue()
      @task.continue()

      # Go back to the course selection
      @utils.wait.click(css: '.navbar-brand')
