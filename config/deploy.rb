set :application, 'oslodemo'
set :repository, 'git@github.com:bengler/oslodemo'
set :stages, ['production']
set :runner, 'oslodemo'

# Must be loaded after setting options
require 'capistrano/bengler'
