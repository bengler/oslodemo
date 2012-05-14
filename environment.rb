require File.expand_path('config/site.rb') if File.exists?('config/site.rb')

require 'rubygems'
require 'bundler/setup'
require 'logger'
require 'sinatra'
require 'haml'
require 'coffee_script'
require 'sass'
require 'rack/cache'
require 'yajl/json_gem'

set :root, File.dirname(__FILE__)
set :haml, :format => :html5

configure :development do
end

configure :production do
  require 'dalli'
  require 'rack/cache'

  before do
    cache_control :public, :max_age => 600
  end

  use Rack::Cache,
    :metastore    => Dalli::Client.new(:namespace => 'oslodemo_meta'),
    :entitystore  => Dalli::Client.new(:namespace => 'oslodemo_entity'),
    :allow_reload => false
end
