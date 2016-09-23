_ = require 'underscore'

React = require 'react'
BS = require 'react-bootstrap'

CourseGroupingLabel = require '../course-grouping-label'

CourseAddMenuMixin =
  contextTypes:
    router: React.PropTypes.object.isRequired

  propTypes:
    dateFormat: React.PropTypes.string
    hasPeriods: React.PropTypes.bool.isRequired

  getInitialState: ->
    addDate: null

  getDefaultProps: ->
    dateFormat: 'YYYY-MM-DD'

  goToBuilder: (link) ->
    (clickEvent) =>
      clickEvent.preventDefault()
      @context.router.transitionTo(link.to, link.params, link.query)

  renderAddActions: ->
    {courseId} = @props
    {dateFormat, hasPeriods} = @props
    link = "/course/#{courseId}"
    if hasPeriods
      links = [
        {
          text: 'Add Reading'
          to: "#{link}/readings/new"
          type: 'reading'
          query:
            due_at: @state.addDate?.format(dateFormat)
        }, {
          text: 'Add Homework'
          to: "#{link}/homework/new"
          type: 'homework'
          query:
            due_at: @state.addDate?.format(dateFormat)
        }, {
          text: 'Add External Assignment'
          to: "#{link}/externals/new"
          type: 'external'
          query:
            due_at: @state.addDate?.format(dateFormat)
        }, {
          text: 'Add Event'
          to: "#{link}/events/new"
          type: 'event'
          query:
            due_at: @state.addDate?.format(dateFormat)
        }
      ]

    else
      linkText = [
        <span key='no-periods-link-1'>Please add a </span>
        <CourseGroupingLabel
          key='no-periods-link-2'
          lowercase
          courseId={@props.courseId}/>
        <span key='no-periods-link-3'> in </span>
        <br key='no-periods-link-4'/>
        <span
          className='no-periods-course-settings-link'
          key='no-periods-link-5'>Course Settings</span>
        <span key='no-periods-link-6'> before</span>
        <br key='no-periods-link-7'/>
        <span key='no-periods-link-8'>adding assignments.</span>
      ]

      links = [{
        text: linkText
        to: "/course/#{courseId}/settings"
        type: 'none'
      }]

    for link in links
      href = @context.router.createHref(link.to)
      <li
        key={link.type}
        data-assignment-type={link.type}
        ref="#{link.type}Link">
        <a href={href} onClick={@goToBuilder(link)} >
          {link.text}
        </a>
      </li>


module.exports = CourseAddMenuMixin
