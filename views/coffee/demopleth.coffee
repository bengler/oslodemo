class Demopleth

  constructor: ->
    console.info("Ignition")


    path = d3.geo.path()

    svg = d3.select("#chart")
      .append("svg")

    projection = d3.geo.albers().origin([10.739597, 59.910584]).translate([600,300]).scale(180000)
    path = d3.geo.path().projection(projection)

    counties = svg.append("g")
      .attr("id", "counties")

    states = svg.append("g")
      .attr("id", "states")

    d3.json "regions.json", (json) -> 
      states.selectAll("path")
      .data(json.features)
      .enter().append("path")
      .attr("d", path)
      .on "mouseover", (d,i) -> 
        console.info(d)
        d3.select(this)
          .transition()
          .style("fill", "#fa5")
          .style("opacity", "0.5")
      .on "mouseout", (d,i) -> 
        d3.select(this)
          .transition()
          .style("fill", "#666")
          .style("opacity", "0.3")

    d3.json "region_parts.json", (json) -> 
      counties.selectAll("path")
      .data(json.features)
      .enter().append("path")
      .attr("d", path)


    # d3.json("unemployment.json", function(json) {
    #   data = json
    #   counties.selectAll("path")
    #       .attr("class", quantize)
    # })

  # quantize: (d) -> 
  #   "q" + Math.min(8, ~~(data[d.id] * 9 / 12)) + "-9"
    

window.Demopleth = Demopleth