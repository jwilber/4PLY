// set the dimensions and lineMargins of the graph
let lineMargin = { top: 10, right: 30, bottom: 60, left: 100 },
  chartWidth = 800 - lineMargin.left - lineMargin.right,
  chartHeight = 400 - lineMargin.top - lineMargin.bottom;

// append the svg object to the body of the page
const obstaclesChart = d3.select("#crusttime")
  .append("svg")
  .attr('id', 'lineSvg')
  .attr('width', chartWidth + lineMargin.left + lineMargin.right)
  .attr('height', chartHeight + lineMargin.top + lineMargin.bottom)
  // .attr("preserveAspectRatio", "none")
  .attr("viewBox", `0 0 ${(chartWidth + lineMargin.left + lineMargin.right)}
    ${(chartHeight + lineMargin.top + lineMargin.bottom)}`)
  .append("g")
  .attr("transform",
    "translate(" + lineMargin.left + "," + lineMargin.top + ")");

// d3.select('#lineSvg')
//   .append('text')
//   .attr('x', (chartWidth + lineMargin.right) / 2.5)
//   .attr('y', lineMargin.top *2)
//   .html("TIMELINE: CRUST OVER TIME")
//   .style('font-family', "Bungee Inline")
//   .style('font-size', '1rem')

// add x-axis
d3.select('#lineSvg')
  .append("text")    
  .attr('x', (chartWidth + lineMargin.right + lineMargin.left) / 2)  
  .attr('y', chartHeight + lineMargin.top + 50)       
  .style("text-anchor", "left")
  .style('font-family', "Bungee")
  .style('font-size', '.02rem')
  .text("Year");

// text label for the y axis
  // d3.select('#lineSvg')
  //   .append("text")
  //   .attr("transform", "rotate(-90)")
  //   .attr("y", lineMargin.left / 2)
  //   .attr("x",0 - (chartHeight / 2))
  //   .attr("dy", "1em")
  //   .style("text-anchor", "middle")
  //   .style('font-family', "LeagueGothicRegular")
  //   .style('font-size', '1.4rem')
  //   .text("Count"); 


//Read the data
d3.csv("../data2/crust_df.csv", function (data) {

  // group the data: I want to draw one line per group
  const sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(d => d.obstacle)
    .entries(data);

  // Add X axis --> it is a date format
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([0, chartWidth]);
  obstaclesChart.append("g")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(d3.axisBottom(x).ticks(11).tickFormat(d3.format("d")));

  // Add Y axis
  const y = d3.scaleLinear()
    // .domain([0, d3.max(data, d => +d.count)])
    .domain([-0.1, 65])
    .range([chartHeight, 0]);
  obstaclesChart.append("g")
    .call(d3.axisLeft(y));

  const keys = sumstat.map(d => d.key[0].toUpperCase() + d.key.slice(1))

  // color palette
  const color = d3.scaleOrdinal()
    .domain(keys)
    .range(['#e9778b', 'orange', 'teal'])


  // Draw the line
  obstaclesChart.selectAll(".line")
    .data(sumstat)
    .enter()
    .append("path")
    .attr('class', 'ts')
    .attr("fill", "none")
    .attr("stroke", d => color(d.key))
    .attr('active', true)
    .attr("stroke-width", d => 4)
    .style('opacity', .85)
    // .attr("stroke-chartWidth", 1.5)
    .attr("id", d => d.key)
    .attr("d", function (d) {
      return d3.line()
        .x(d => x(d.year))
        .y(d => y(+d.count))
        .curve(d3.curveCardinal.tension(1.5))
        (d.values)
    })

})

