React = require 'react'
BS = require 'react-bootstrap'
Router = require 'react-router'
{CurrentUserStore} = require '../../flux/current-user'
{TransitionAssistant} = require '../unsaved-state'

module.exports = React.createClass
  displayName: 'Navigation'

  contextTypes:
    router: React.PropTypes.func

  redirectToAccount: ->
    TransitionAssistant.checkTransitionStateTo("Account Profile Page").then ->
      window.location.href = CurrentUserStore.getProfileUrl()

  render: ->
    return null unless CurrentUserStore.getProfileUrl()
    <BS.MenuItem onSelect={@redirectToAccount} >
      My Account
    </BS.MenuItem>
