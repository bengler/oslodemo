# encoding: UTF-8

require './environment'

get '/' do
  haml :demo
end

get '/stills' do
  haml :stills
end

get '/stylesheet.css' do
  content_type 'text/css', :charset => 'utf-8'
  sass :stylesheet, :style => :compact
end

get '/burroughs' do
  haml :demo_map
end
