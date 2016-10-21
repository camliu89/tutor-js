React = require 'react'
BS = require 'react-bootstrap'
EventEmitter2 = require 'eventemitter2'
{CloseButton} = require 'shared'

Status = require './status-mixin'

Course = require '../course/model'

api = require '../api'

# TODO combine this with link in error notification
GET_HELP_LINK = 'http://openstax.force.com/support?l=en_US&c=Products%3AConcept_Coach'

getWaitingText = (status) ->
  "#{status}…"

UserMenu = React.createClass
  mixins: [Status]

  contextTypes:
    close: React.PropTypes.func
    navigator: React.PropTypes.instanceOf(EventEmitter2)

  propTypes:
    course: React.PropTypes.instanceOf(Course)

  componentWillMount: ->
    @getUser().ensureStatusLoaded()

  logoutUser: (clickEvent) ->
    clickEvent.preventDefault()
    @context.navigator.emit('show.logout', view: 'logout')

  showProfile: (clickEvent) ->
    clickEvent.preventDefault()
    @context.navigator.emit('show.profile', view: 'profile')

  updateStudentId: (clickEvent) ->
    clickEvent.preventDefault()
    @context.navigator.emit('show.student_id', view: 'student_id')

  update: ->
    @forceUpdate() if @isMounted()

  close: (clickEvent) ->
    clickEvent.preventDefault()
    @context.close?()

  modifyCourse: (clickEvent) ->
    clickEvent.preventDefault()
    @context.navigator.emit('show.registration', view: 'registration')

  renderCourseOption: ->
    if not @props.course?.isRegistered()
      courseChangeText = 'Register for Section'
      <BS.MenuItem onSelect={@modifyCourse}>{courseChangeText}</BS.MenuItem>

  renderStudentIdOption: ->
    return null unless @props.course?.isRegistered()
    <BS.MenuItem onSelect={@updateStudentId}>Change student ID</BS.MenuItem>

  render: ->
    # The menu has no valid actions unless the useris logged in
    user = @getUser()
    return null unless user.isLoggedIn()

    <BS.NavDropdown className='concept-coach-user' id='concept-coach-user-menu' title={user.name}>
      {@renderCourseOption()}
      <BS.MenuItem onSelect={@showProfile}>Account Profile</BS.MenuItem>
      {@renderStudentIdOption()}
      <BS.MenuItem divider key='dropdown-item-divider'/>
      <BS.MenuItem
        key='nav-help-link'
        className='-help-link'
        target='_blank'
        href={GET_HELP_LINK}>
          Get Help
      </BS.MenuItem>
      <BS.MenuItem onSelect={@logoutUser}>Logout</BS.MenuItem>
    </BS.NavDropdown>


module.exports = UserMenu
