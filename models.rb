
class Region
  include DataMapper::Resource
  property :id,             Integer,    :required => true, :key => true
  property :geom,           DMGeometry, :required => false
end
