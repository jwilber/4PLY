// set the dimensions and margins of the graph
var margin3 = {top: 5, right: window.innerWidth / 10,
 bottom: 70, left: window.innerWidth / 10},
    width3 = (window.innerWidth < 1000
        ? window.innerWidth / 1.2
        : window.innerWidth / 1.3) - (window.innerWidth / 10) - (window.innerWidth / 10);
    height3 = window.innerHeight / 2 - 10;




// legendSpace = width/4;

// append the svg object to the body of the page
var svg3 = d3.select("#barplot")
  .append("svg")
    .attr("width", width3 + margin3.left + margin3.right)
    .attr("height", height3 + margin3.top + margin3.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin3.left + "," + margin3.top + ")");

// Parse the Data
d3.csv("data/barplot.csv", function(data) {

  // List of subgroups = header of the csv files = soil condition here
  var subgroups = data.columns.slice(1)

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  var groups = d3.map(data, function(d){return(d.year)}).keys()

  // Add X axis
  var x = d3.scaleBand()
      .domain(groups)
      .range([0, width3])
      .padding([0.2])
  svg3.append("g")
    .attr("transform", "translate(0," + height3 + ")")
    .call(d3.axisBottom(x).ticks(6).tickSizeOuter(0));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 17])
    .range([ height3, 0 ]);
  svg3.append("g")
    .call(d3.axisLeft(y));

  // color palette = one color per subgroup
  var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['red','orange','#F6D300','#B3FF19','#00B31E','#99CCFF','#3377FF','#D9B3FF','black'])

  //stack the data? --> stack per subgroup
  var stackedData = d3.stack()
    .keys(subgroups)
    (data)




  // ----------------
  // Create a tooltip
  // ----------------
  var tooltip3 = d3.select("#barplot")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip3")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("position", "relative")
    .style("left", "0px")
    .style("width", "15%")

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    var subgroupName = d3.select(this.parentNode).datum().key;
    var subgroupValue = d.data[subgroupName];
    tooltip3
        .html(subgroupName + ", " + subgroupValue)
        .style("opacity", 1)
  }
  var mousemove = function(d) {
    tooltip3
      .style("left", (d3.mouse(this)[0]) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", (d3.mouse(this)[1])-200 + "px")
  }
  var mouseleave = function(d) {
    tooltip3
      .style("opacity", 0)
  }




  // Show the bars
  svg3.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .enter().append("g")
      .attr("fill", function(d) { return color(d.key); })
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return x(d.data.year); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width",x.bandwidth())
        .attr("stroke", "grey")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)

})
