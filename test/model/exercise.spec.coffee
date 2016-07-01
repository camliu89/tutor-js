{Testing, expect, sinon, _} = require 'test/helpers'

Exercise = require 'model/exercise'
VideoPlaceholder = require 'components/exercise-preview/video-placeholder'

EXERCISE = require 'stubs/exercise-preview/data'

describe 'Exercise Model Helpers', ->

  it 'tests for types', ->
    expect( Exercise.isMultipart(EXERCISE) ).to.be.true
    expect( Exercise.hasVideo(EXERCISE) ).to.be.true
    expect( Exercise.hasInteractive(EXERCISE) ).to.be.false
