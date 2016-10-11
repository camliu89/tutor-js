{React, Testing, expect, sinon, _} = require '../helpers/component-testing'

{ shallow } = require 'enzyme'

UserActionsMenu = require '../../../src/components/navbar/user-actions-menu'
{CourseActions, CourseStore} = require '../../../src/flux/course'
{testParams, setupStores, resetStores, userModel, courseModel} = require './spec-test-params'

FakeWindow = require 'shared/test/helpers/fake-window'

testWithRole = (roleType) ->

  ->
    before ->
      @roleTestParams = setupStores(roleType)
      @props =
        onItemClick: sinon.spy()
        courseId: courseModel.id
        windowImpl: new FakeWindow

    after ->
      resetStores(roleType)

    it 'includes a link to get help', ->
      wrapper = shallow(<UserActionsMenu {...@props} />)
      expect(wrapper.find('.-help-link')).to.exist


    it 'should have expected dropdown menu', ->
      Testing.renderComponent( UserActionsMenu, props: @props ).then ({dom}) =>
        dropdownItems = dom.querySelectorAll('li')
        roleItems = Array.prototype.slice.call(dropdownItems, 0, -4)
        labels = _.pluck(@roleTestParams.menu, 'label')
        labels.push 'Browse the Book'
        roleItemLabels = _.pluck(roleItems, 'innerText')
        expect(roleItemLabels).to.deep.equal(labels)


    it 'should have link to browse the book', ->
      Testing.renderComponent( UserActionsMenu, props: @props ).then ({dom}) ->
        bookLink = dom.querySelector('.view-reference-guide')
        expect(bookLink).not.to.be.null
        expect(bookLink.getAttribute('target')).to.equal('_blank')


    it 'should have performance forecast menu', ->
      Testing.renderComponent( UserActionsMenu, props: @props ).then ({dom}) ->
        dropdownItems = dom.querySelectorAll('li')
        expect(_.pluck(dropdownItems, 'innerText')).to.include('Performance Forecast')


    describe 'A concept coach course', ->
      beforeEach ->
        courseModel.is_concept_coach = true
        CourseActions.loaded(courseModel, courseModel.id)
      afterEach ->
        courseModel.is_concept_coach = false
        CourseActions.loaded(courseModel, courseModel.id)

      it 'should not have disallowed menus', ->
        Testing.renderComponent( UserActionsMenu, props: @props ).then ({dom}) ->
          dropdownItems = dom.querySelectorAll('li')
          expect(_.pluck(dropdownItems, 'innerText')).to.not.include('Performance Forecast')
          expect(_.pluck(dropdownItems, 'innerText')).to.not.include('Browse the Book')




describe 'Student Navbar Component', testWithRole('student')

describe 'Teacher Navbar Component', testWithRole('teacher')
