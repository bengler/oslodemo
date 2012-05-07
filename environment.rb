require 'rubygems'
require 'bundler/setup'
require 'logger'
require 'sinatra'
require 'haml'
require 'coffee_script'
require 'sass'
require 'rack/cache'
require 'yajl/json_gem'
require 'o5-logging'

set :root, File.dirname(__FILE__)
set :haml, :format => :html5

configure :development do
end

configure :production do

  require 'dalli'
  require 'rack/cache'

  memcache = Dalli::Client.new(:namespace => 'oslodemo', :expires_in => 60*60*24, :compress => true)

  Log = O5.log
  Dalli.logger = O5.log if defined?(Dalli)

  before do
    cache_control :public, :max_age => 172800
  end

  use Rack::Cache,
    :metastore    => Dalli::Client.new,
    :entitystore  => 'file:tmp/cache/rack/body',
    :allow_reload => false

end


