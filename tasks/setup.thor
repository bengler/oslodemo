require "./environment"

# encoding: UTF-8

class Test < Thor


  desc "read_aggregates", "Read aggregate data"
  def read_aggregates

    lines = CSV.parse(File.read("data/oslo_sums_1990_20203.csv"))

    CSV.open("public/population_oslo.csv", "wb") do |csv|
      csv << ["year", "age", "sex", "people"]

      # year age sex (1-2) people

      8.times do |i|
        pos = 4 + i*3
        current_set = lines[pos..pos+3]
        year = current_set[0][0].match(/\d*/)[0].to_i

        gender = 1
        current_set[1][2..-1].each_with_index do |p, i|
          pop = p.strip.gsub(',', "").to_i
          csv << [year, i, gender, pop]
        end

        gender = 2
        current_set[2][2..-1].each_with_index do |p, i|
          pop = p.strip.gsub(',', "").to_i
          csv << [year, i, gender, pop]
        end
      end
    end
  end

  desc "read_demo_sheets", "Read demography sheets"
  def read_demo_sheets
    puts "Munging CSV"

    years = []

    Dir.glob('data/demografi/*').each do |file|
      lines = CSV.parse(File.read(file))

      year = file.match(/bydeler(\d*)/)[1].to_i
      puts "Reading year: " + year.to_s

      year_result = {}

      totals =  lines[3..3+18]
      male   =  lines[27..27+18]
      female =  lines[51..51+18]

#      read_regions(totals,  :gender => 0)
#      read_regions(male,    :gender => 1)
      read_regions(female,  :gender => 2)




    end



  end

  desc "to_geo_json", "Render regions to geojson" 
  def to_geo_json


    fields = [:bydel_nr, :bydel_navn, :delbydel_nr, :delbydel_navn, :grunnkrets_nr, :grunnkrets_navn]

    bydeler = {}
    delbydeler = {}

    CSV.parse(File.read("./data/delbydel_2007.csv"), :headers => false)[1..-1].each do |row|
      keys = Hash[*fields.zip(row).flatten]

      bydel_nr = keys[:bydel_nr].to_i
      delbydel_nr = keys[:delbydel_nr].to_i

      bydeler[bydel_nr] ||= {:grunnkretser => []}
      bydeler[bydel_nr][:grunnkretser] << fullyQualifiedRegion(keys[:grunnkrets_nr])
      bydeler[bydel_nr][:navn] ||= keys[:bydel_navn]

      delbydeler[delbydel_nr] ||= {:grunnkretser => []}
      delbydeler[delbydel_nr][:grunnkretser] << fullyQualifiedRegion(keys[:grunnkrets_nr])
      delbydeler[delbydel_nr][:navn] ||= keys[:delbydel_navn]
    end
    puts "\n"


    result = build_geoJSON(bydeler)
    File.open("./public/regions.json", 'w') {|f| f.write(result.to_json) }

    result = build_geoJSON(delbydeler)
    File.open("./public/region_parts.json", 'w') {|f| f.write(result.to_json) }

  end

  no_tasks do

    def read_regions(regions, options)
      gender = options[:gender]

      regions.each do |region|
        ident = region.shift

        key,name = ident.match(/(\d*)(.*)/)[1..2]
        name.strip!

        if key.empty?
          key = name 
          key = key.downcase
          key = "oslo" if key == "Oslo i alt"
        end

        total_check = region.shift
        total = region.inject(0) { |a,b| a + b.to_i }

        year_array = []
        region.each { |n| year_array << n.to_i }

        puts "#{key} : #{gender} #{total_check}/#{total}"
      end
      puts "\n\n"
    end


    def read_block lines
      puts lines.inspect
    end


    def build_geoJSON region_struct
      result = {
        "type" => "FeatureCollection",
        "features" => []
      }

      region_struct.each_pair do |id, bydel|
        grkretser = bydel[:grunnkretser]
        puts grkretser.inspect

        # geometry = repository(:default).adapter.select("SELECT ST_AsGeoJSON(ST_Union(geog)) FROM regions WHERE grkr_tall in (#{grkretser.join(',')})")[0]
        geometry = repository(:default).adapter.select("SELECT ST_AsGeoJSON(ST_Union(ST_Buffer(geog, 0.0000000010))) FROM regions WHERE grkr_tall in (#{grkretser.join(',')})")[0]

        if geometry 
          geometry = JSON.parse(geometry)
          feature = {
            "type" => "Feature",
            "id" => id.to_s,
            "properties" => {"name" => bydel[:navn]},
            "geometry" => geometry
          }
          result["features"] << feature
        end
      end
      result
    end


    def fullyQualifiedRegion num
      ("301" + num.rjust(4, "0")).to_i
    end

  end


end