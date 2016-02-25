selenium = require 'selenium-webdriver'
{TestHelper} = require './test-element'


COMMON_ELEMENTS =
  courseByAppearance: (appearance, isCoach = false) ->
    dataAttr = 'data-appearance'

    if appearance?
      dataAttr += "='#{appearance}'"

    if isCoach
      teacherLink = "[#{dataAttr}] > [href*='cc-dashboard']"
      studentLink = "[#{dataAttr}] > [href*='content']"
    else
      teacherLink = "[#{dataAttr}] > [href*='calendar']"
      studentLink = "[#{dataAttr}] > [href*='list']"

    css: "#{teacherLink}, #{studentLink}"

  courseByTitle: (title) ->
    css: "[data-title='#{name}'] > a"

class CourseSelect extends TestHelper

  constructor: (test, testElementLocator) ->

    testElementLocator ?= '.course-listing'
    super(test, '.course-listing', COMMON_ELEMENTS)

  goToByType: (category) ->
    @waitUntilLoaded()
    # Go to the bio dashboard
    switch category
      when 'BIOLOGY' then @el.courseByAppearance('biology').click()
      when 'PHYSICS' then @el.courseByAppearance('physics').click()
      when 'CONCEPT_COACH' then @el.courseByAppearance(null, true).click()
      else @el.courseByAppearance().click()

    @waitUntilLoaded() # TODO: This should probably use the `dashboard.waitUntilLoaded()`

  goToByTitle: (name) ->
    @el.courseByTitle(name).waitClick()

module.exports = CourseSelect
