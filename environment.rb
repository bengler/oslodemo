require 'rubygems'
require 'bundler/setup'
require 'logger'
require 'sinatra'
require 'data_mapper'
require 'dm-postgis'
require 'haml'
require 'coffee_script'
require 'sass'
require 'unicode'
require 'rack/cache'
require 'yajl/json_gem'

set :root, File.dirname(__FILE__)
set :haml, :format => :html5

DataMapper::Model.raise_on_save_failure = true

configure :development do
  PLANAR_URL = "http://hoko.bengler.no:3000"
  DataMapper.setup(:default, 'postgres://localhost/regions')
end


configure :production do
  PLANAR_URL = "http://planar.bengler.no"
  DataMapper.setup(:default, 'postgres://localhost/regions')

  require 'memcached'
  require 'rack/cache'
  before do
    cache_control :public, :max_age => 172800
  end
  use Rack::Cache,
    :verbose     => true,
    :metastore   => 'memcached://localhost:11211/meta',
    :entitystore => 'memcached://localhost:11211/body'
end



require './models'
DataMapper.finalize

