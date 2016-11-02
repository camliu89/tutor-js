_ = require 'lodash'
minimatch = require 'minimatch'
{Promise} = require 'es6-promise'

makeLocalRequest = (requestConfig) ->
  {url} = requestConfig

  [uri, params] = url.split('?')
  if requestConfig.method is 'GET'
    url_parts = ["#{uri}.json", params]
  else
    url_parts = ["#{uri}/#{requestConfig.method}.json", params]
    requestConfig.mockMethod = requestConfig.method
    requestConfig.method = 'GET'

  requestConfig.url = _.compact(url_parts).join('?')

makeLocalResponse = (response) ->
  payload = if response.config.data then JSON.parse(response.config.data) else {}
  response.data = _.extend({}, response.data, payload)

doesErrorMatch = (handledErrors, errorName) ->
  _.indexOf(handledErrors, errorName) > -1 or
    _.some(handledErrors, _.partial(minimatch, errorName))

areAllErrorsHandled = (handledErrors, errors, errorNameProperty) ->
  isErrorHandled = _.partial(doesErrorMatch, handledErrors)
  _.every errors, _.flow(_.property(errorNameProperty), isErrorHandled)


class Interceptors
  constructor: (hooks = {}, apiHandler) ->
    @_apiHandler = apiHandler
    @_hooks = hooks
    @

  queRequest: (requestConfig) =>
    @_apiHandler.records.queRequest(requestConfig)
    requestConfig

  makeLocalRequest: (requestConfig) =>
    makeLocalRequest(requestConfig)
    requestConfig

  setResponseReceived: (response) =>
    @_apiHandler.records.recordResponse(response)
    response

  setErrorReceived: (response) =>
    @_apiHandler.records.recordResponse(response)
    Promise.reject(response)

  broadcastSuccess: (response) =>
    {config} = response
    @_apiHandler.channel.emit(config.events.success, response)
    response

  broadcastError: (response) =>
    {config} = response
    @_apiHandler.channel.emit(config.events.failure, response)
    Promise.reject(response)

  makeLocalResponse: (response) =>
    makeLocalResponse(response)
    response

  handleNonAPIErrors: (error) =>
    unless error.response
      status = 1
      statusText = "#{error.name} #{error.message}"
      data = error.stack

      # spoof response error
      error.response = {status, statusText, data}

    Promise.reject(error)

  handleLocalErrors: (error) =>
    {response, config} = error
    {status, statusText} = response
    {method, mockMethod} = config

    mockMethods = ['PUT', 'PATCH']

    # Hack for local testing, fake successful PUT and PATCH
    if status is 404
      response.data = """No mock data found at #{config.url}.
      This error only happens locally."""

    # Hack for local testing. Webserver returns 200 + HTML for 404's
    if statusText is 'parsererror' and status is 200
      response.status = 404
      response.data = 'Error Parsing the JSON or a 404'

    Promise.reject(error)

  handleMalformedRequest: (error) =>
    error = @_hooks.handleMalformedRequest(error) if error.response.status is 400 and @_hooks.handleMalformedRequest?

    Promise.reject(error) if _.isError(error)

  handleNotFound: (error) =>
    if error.response.status is 404
      error.response.statusText ?= 'ERROR_NOTFOUND'
      error = @_hooks.handleNotFound(error) if @_hooks.handleNotFound?

    Promise.reject(error) if _.isError(error)

  handleErrorMessage: (error) =>
    {statusText, data} = error.response

    try
      msg = JSON.parse(statusText)
    catch e
      msg = statusText

    error.response.statusMessage = msg

    unless _.isObject(data)
      try
        error.response.data = JSON.parse(data)
      catch e

    Promise.reject(error)

  filterErrors: (error) =>
    {response, config} = error
    {data} = response

    if (_.isEmpty(config.handledErrors) or _.isEmpty(data.errors)) or
      not areAllErrorsHandled(config.handledErrors, data.errors, @_apiHandler.getOptions().errorNameProperty)
        Promise.reject(error)

module.exports = {Interceptors}
