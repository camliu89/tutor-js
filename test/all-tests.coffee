{expect} = require 'chai'

require './crud-store.spec'
require './task-store.spec'
require './loadable.spec'
require './teacher-task-plan-store.spec'

# This should be done **last** because it starts up the whole app
require './router.spec'
