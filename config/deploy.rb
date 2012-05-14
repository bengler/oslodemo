set :application, 'oslodemo'
set :repository, 'git@github.com:bengler/oslodemo'
set :stages, ['production']
set :runner, 'oslodemo'
set :unicorn_config, '/srv/oslodemo/shared/config/unicorn.rb'
set :unicorn_pid, '/srv/oslodemo/shared/pids/unicorn.pid'

# Must be loaded after setting options
require 'capistrano/bengler'
