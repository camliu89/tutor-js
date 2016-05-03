{Testing, expect, sinon, _} = require 'test/helpers'

URLs = require 'model/urls'
describe 'URLs', ->

  beforeEach ->
    @urls = {foo_url: 'http://foo.bar.com/'}
    URLs.update(@urls)

  afterEach ->
    URLs.reset()

  it 'strips _url from keys', ->
    expect( URLs.get('foo') ).to.equal( 'http://foo.bar.com' )

  it 'can construct a url from parts', ->
    expect( URLs.construct('foo', 'bar', 'baz', 1) )
      .to.equal( 'http://foo.bar.com/bar/baz/1' )


  it 'ignores non-string urls', ->
    URLs.update({
      'object': {object: true}
      'number': 42
    })
    expect( URLs.get('object') ).not.to.exist
    expect( URLs.get('number') ).not.to.exist
