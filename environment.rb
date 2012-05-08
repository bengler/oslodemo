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
  require 'hupper'
  require 'rack/cache'

  Log = O5.log
  Dalli.logger = O5.log if defined?(Dalli)

  before do
    cache_control :public, :max_age => 600
  end

  $memcached_entity = Dalli::Client.new(:namespace => 'oslodemo_entity', :expires_in => 60*60*24, :compress => true)
  $memcached_meta = Dalli::Client.new(:namespace => 'oslodemo_meta', :expires_in => 60*60*24, :compress => true)

  use Rack::Cache,
    :metastore    => $memcached_meta,
    # FIXME will break on cluster, filesystem is local to each server (obv)
    :entitystore  => $memcached_entity,
    :allow_reload => false

  Hupper.on_release do
    $memcached_entity.close
    $memcached_meta.close
  end
end
