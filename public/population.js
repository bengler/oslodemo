
// SVG test taken from Modernizr 2.0
if (! !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect) {
  document.location = "stills";
  return
}

var width = 700,
    height = 450;

var x = d3.scale.linear()
    .range([0, width - 50]);

var y = d3.scale.linear()
    .range([0, height - 20]);

// An SVG element with a bottom-right origin.

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + 60 + "," + (height - 40) + ")scale(1,-1)");

// A sliding container to hold the bars.
var body = svg.append("g")
    .attr("transform", "translate(0,0)");

// A container to hold the y-axis rules.
var rules = svg.append("g");

var legend = svg.append("g")
    .attr("transform", "translate(" + x(0.63)  + "," + y(0.70) + ")scale(1,-1)");

legend.append("rect")
  .attr("x", 80)
  .attr("y", 0)
  .attr("width", 15)  
  .attr("height", 15)
  .attr("fill", "#ad0101")
  .attr("opacity", "0.5");

legend.append("rect")
  .attr("x", 140)
  .attr("y", 0)
  .attr("width", 15)  
  .attr("height", 15)
  .attr("stroke-width", "1px")
  .attr("stroke-width", "1px")

var title = legend.append("text")
  .attr("class", "title")
  .attr("dy", "-20")
  .attr("text-anchor", "start")
  .attr("opacity", ".5")
  .text(1990)

legend.append("text")
  .attr("x", 100)
  .attr("y", 12)
  .attr("class", "legendType")
  .text("Menn")

legend.append("text")
  .attr("x", 160)
  .attr("y", 12)
  .attr("class", "legendType")
  .text("Kvinner")



d3.csv("population_oslo.csv", function(data) {

// Convert strings to numbers.
data.forEach(function(d) {
  d.people = +d.people;
  d.year = +d.year;
  d.age = +d.age;
});

// Compute the extent of the data set in age and years.
var age0 = 0,
    age1 = d3.max(data, function(d) { return d.age; }),
    year0 = d3.min(data, function(d) { return d.year; }),
    year1 = d3.max(data, function(d) { return d.year; }),
    year = year0;

// Update the scale domains.
x.domain([0, age1 + 1]);
y.domain([0, d3.max(data, function(d) { return d.people; })]);

// Add rules to show the population values.
rules = rules.selectAll(".rule")
    .data(y.ticks(10))
  .enter().append("g")
    .attr("class", "rule")
    .attr("transform", function(d) { return "translate(" + x(1) + "," + y(d) + ")scale(1,-1)"; });

rules.append("line")
  .attr("x1", width - 40);

rules.append("text")
  .attr("x", x(0) - 7)
  .attr("dy", ".35em")
  .attr("class", "label")
  .attr("text-anchor", "end")
  .text(function(d) { return d; });

svg.append("text")
  .attr("x", 0)
  .attr("class", "axisLabel")
  .attr("text-anchor", "middle")
  .text("Antall")
  .attr("transform", "translate(-40," + height/2 + ")rotate(-90)scale(-1,1)");

svg.append("text")
  .attr("x", 0)
  .attr("class", "axisLabel")
  .attr("text-anchor", "middle")
  .text("Alder")
  .attr("transform", "translate(" + width/2 + ", -40)scale(-1,1)rotate(180)");


  // Add labeled rects for each birthyear.
  var years = body.selectAll("g")
      .data(d3.range(year0 - age1, year1 + 1, 1))
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + x(year1 - d) + ",0)"; });

  years.selectAll("rect")
      .data(d3.range(2))
    .enter().append("rect")
      .attr("x", 1)
      .attr("width", x(1) - 2)
      .attr("height", 1e-6);

  // Add labels to show the age.
  svg.append("g").selectAll("text")
      .data(d3.range(0, age1, 5))
    .enter().append("text")
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .attr("transform", function(d) { return "translate(" + (x(d) + x(1.5)) + ",-4)scale(1,-1)"; })
      .attr("dy", "1em")
      .text(String);

  // Nest by year then birthyear.
  data = d3.nest()
    .key(function(d) { return d.year; })
    .key(function(d) { return d.year - d.age; })
    .rollup(function(v) { return v.map(function(d) { return d.people; }); })
    .map(data);

  yearList = _(data).keys().map( function(i) { i = +i;return i } ).sort()
  var yearIndex = 0

  _(yearList).each(function(eachYear) {
    e = jQuery('<li/>', {
        title: eachYear,
        text: eachYear
    }).appendTo('#years')

    e.click(function() {
      changeYear(eachYear);
    });
  });

  redraw();

  // Allow the arrow keys to change the displayed year.
  d3.select(window).on("keydown", function() {
    switch (d3.event.keyCode) {
      case 37:
        yearIndex = Math.max(0, yearIndex - 1); 
        break;
      case 39: 
        yearIndex = Math.min(yearList.length-1, yearIndex + 1); 
        break;
    }
    year = yearList[yearIndex]
    redraw();
  });

  function changeYear(newYear) {
    yearIndex = _.indexOf(yearList, newYear);
    year = newYear;
    redraw();
  }

  function redraw() {
    if (!(year in data)) return;

    $('ul#years li').removeClass('selected');
    $('ul#years li').eq(yearIndex).addClass('selected');

    title.text(year);

    body.transition()
        .duration(750)
        .attr("transform", function(d) { return "translate(" + x(year - year1 + 1)  + ",0)"; });

    years.selectAll("rect")
        .data(function(d) { return data[year][d] || [0, 0]; })
      .transition()
        .duration(750)
        .attr("height", y);
  }
  window.redraw = redraw;
});
