
var width = 760,
    height = 600;

// SVG test taken from Modernizr 2.0
if (! (!!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect)) {
  document.location = "stills";
}

/*
  * Normalized hide address bar for iOS & Android
  * (c) Scott Jehl, scottjehl.com
  * MIT License
*/

(function( win ){
  var doc = win.document;

  // If there's a hash, or addEventListener is undefined, stop here
  if( !location.hash && win.addEventListener ){

    //scroll to 1
    window.scrollTo( 0, 1 );
    var scrollTop = 1,
      getScrollTop = function(){
        return win.pageYOffset || doc.compatMode === "CSS1Compat" && doc.documentElement.scrollTop || doc.body.scrollTop || 0;
      },

      //reset to 0 on bodyready, if needed
      bodycheck = setInterval(function(){
        if( doc.body ){
          clearInterval( bodycheck );
          scrollTop = getScrollTop();
          win.scrollTo( 0, scrollTop === 1 ? 0 : 1 );
        } 
      }, 15 );

    win.addEventListener( "load", function(){
      setTimeout(function(){
        //at load, if user hasn't scrolled more than 20 or so...
        if( getScrollTop() < 20 ){
          //reset to hide addr bar at onload
          win.scrollTo( 0, scrollTop === 1 ? 0 : 1 );
        }
      }, 0);
    } );
  }
})( this );


var graphWidth = 600,
    graphHeight = 300;

var x = d3.scale.linear()
    .range([0, graphWidth]);

var y = d3.scale.linear()
    .range([0, graphHeight]);

// An SVG element with a bottom-right origin.

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", "0 0 " + (width + 50) + " " + height)
    .attr("preserveAspectRatio", "xMidYMid")
  .append("g")
    .attr("transform", "translate(" + 60 + "," + (height - 40) + ")");

var data; // loaded asynchronously

var path = d3.geo.path();

var projection = d3.geo.albers().origin([10.739597, 59.910584]).translate([500,-370]).scale(120000)
var path = d3.geo.path().projection(projection)

var burroughs = svg.append("g")
    .attr("id", "states")
    .attr("transform", "scale(1,1)");

window.currentBurroughElement = undefined

dataLoaded = jQuery.Deferred();
csvLoaded = jQuery.Deferred();

d3.json("regions.json", function(json) {
  burroughs.selectAll("path")
      .data(json.features)
    .enter().append("path")
      .attr("class", data ? quantize : null)
      .attr("d", path)
    .on("mouseover", function(d,i) { 
      selectBurrough(d,i, this);

    })

  function selectBurrough(d,i,el) {
    if (window.currentBurroughElement != undefined) {
      d3.select(window.currentBurroughElement)
        .transition()
        .style("fill", "#aaa")
        .style("opacity", "0.3")
    }

    currentBurrough = d;

    window.currentBurroughElement = el;

    if (! typeof something === "undefined") {
      redraw();
    }
    d3.select(el)
      .transition()
      .style("fill", "#48a")
      .style("opacity", "0.5")
  }

  currentBurroughElement = burroughs.selectAll("path")[0][0];
  currentBurrough = burroughs.selectAll("path").data()[0];
  selectBurrough(currentBurrough, 0, currentBurroughElement);
  dataLoaded.resolve();
});

var graphContainer = svg.append("g")
    .attr("transform", "translate(0,-150)scale(1,-1)");

// A sliding container to hold the bars.
var body = graphContainer.append("g")
    .attr("transform", "translate(0,0)");

// A container to hold the y-axis rules.
var rules = graphContainer.append("g");

var legend = graphContainer.append("g")
    .attr("transform", "translate(" + 0  + "," + y(1.1) + ")scale(0.9,-0.9)");

legend.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", 15)  
  .attr("height", 15)
  .attr("fill", "#ad0101")
  .attr("opacity", "1");

legend.append("rect")
  .attr("x", 60)
  .attr("y", 0)
  .attr("width", 15)  
  .attr("height", 15)
  .attr("stroke-width", "1px")
  .attr("stroke-width", "1px")

var title = legend.append("text")
  .attr("class", "title")
  .attr("dy", "-10")
  .attr("text-anchor", "start")
  .attr("opacity", "1")
  .text(2005)

legend.append("text")
  .attr("x", 20)
  .attr("y", 12)
  .attr("class", "legendType")
  .text("Menn")

legend.append("text")
  .attr("x", 80)
  .attr("y", 12)
  .attr("class", "legendType")
  .text("Kvinner")

d3.csv("population_oslo_burroughs.csv", function(data) {
  // Convert strings to numbers.
  data.forEach(function(d) {
    d.burrough = +d.burrough;
    d.year = +d.year;
    d.age = +d.age;
    d.people = +(d.people.replace(/,/g,''));
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
    .attr("x1", graphWidth);

  rules.append("text")
    .attr("x", x(0) - 7)
    .attr("dy", ".35em")
    .attr("class", "label")
    .attr("text-anchor", "end")
    .text(function(d) { return d; });

  graphContainer.append("text")
    .attr("x", 0)
    .attr("class", "axisLabel")
    .attr("text-anchor", "middle")
    .text("Antall")
    .attr("transform", "translate(-40," + graphHeight/2 + ")rotate(-90)scale(-1,1)");

  graphContainer.append("text")
    .attr("x", 0)
    .attr("class", "axisLabel")
    .attr("text-anchor", "middle")
    .text("Alder")
    .attr("transform", "translate(" + graphWidth/2 + ", -40)scale(-1,1)rotate(180)");


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
    graphContainer.append("g").selectAll("text")
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
      .key(function(d) { return d.burrough; })
      .key(function(d) { return d.year - d.age; })
      .rollup(function(v) { return v.map(function(d) { return d.people; }); })
      .map(data);


    var yearList = _(data).keys().map( function(i) { i = +i;return i } ).sort()
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


    var swipeOptions=
      {
        swipe:swipe,
        threshold:5
      }
      
      $(function()
      {     
        //Enable swiping...
        $("graphContainer").swipe(swipeOptions);
      });
    
      //Swipe handlers.
      //The only arg passed is the original touch event object      
      function swipe(event, direction)
      {
        if (direction === "right") {
          decrementYear();
        }

        if (direction === "left") {
          incrementYear();
        }
      }


    // Allow the arrow keys to change the displayed year.
    d3.select(window).on("keydown", function() {
      switch (d3.event.keyCode) {
        case 37:
          decrementYear();
          break;
        case 39: 
          incrementYear();
          break;
      }
      redraw();
    });


    function incrementYear() {
      yearIndex = Math.min(yearList.length-1, yearIndex + 1); 
      redraw();
    }

    function decrementYear() {
      yearIndex = Math.max(0, yearIndex - 1); 
      redraw();
    }


    function changeYear(newYear) {
      yearIndex = _.indexOf(yearList, newYear);
      redraw();
    }

    function redraw() {
      year = yearList[yearIndex]
      if (!(year in data)) return;

      $('ul#years li').removeClass('selected');
      $('ul#years li').eq(yearIndex).addClass('selected');

      title.text(year + ", " + currentBurrough.properties.name);

      body.transition()
          .duration(750)
          .attr("transform", function(d) { return "translate(" + x(year - year1 + 1)  + ",0)"; });

      years.selectAll("rect")
          .data(function(d) { return data[year][currentBurrough.id][d] || [0, 0]; })
        .transition()
          .duration(750)
          .attr("height", y);

    }
    window.redraw = redraw;
    csvLoaded.resolve();
});
$.when(dataLoaded, csvLoaded).then(function() { redraw()});

