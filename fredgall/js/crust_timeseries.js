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

// add x-axis
d3.select('#lineSvg')
  .append("text")
  .attr('x', (chartWidth + lineMargin.right + lineMargin.left) / 2)
  .attr('y', chartHeight + lineMargin.top + 50)
  .style("text-anchor", "left")
  .style('font-family', "Bungee")
  .style('font-size', '.02rem')
  .text("Year");

//Read the data
d3.csv("../data2/crust_df.csv", data => {

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
    .domain([-0.1, d3.max(data, d => +d.count) + 5])
    .range([chartHeight, 0]);
  // obstaclesChart.append("g")
  //   .attr('class', 'yaxis')
  //   .attr('transform', `translate(${chartWidth + 10}, 0)`)
  //   .call(d3.axisRight(y));

  obstaclesChart.append("g")
    .attr('class', 'yaxis')
    .call(d3.axisRight(y).tickSize(chartWidth + 10));

  const keys = sumstat.map(d => d.key[0].toUpperCase() + d.key.slice(1))

  // color palette
  const color = d3.scaleOrdinal()
    .domain(keys)
    .range(['#e9778b', 'orange', 'teal'])

  console.log(sumstat);
  // Add circles
  obstaclesChart.selectAll('circle.counts')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'counts')
    .attr('r', 8)
    .attr('cx', d => x(d.year))
    .attr('cy', d => y(+d.count))
    .style('fill', 'tan');


  // Draw the line
  obstaclesChart.selectAll(".line")
    .data(sumstat)
    .enter()
    .append("path")
    .attr('class', 'ts')
    .attr("fill", "none")
    .attr("stroke", 'tan')
    .attr('stroke-linejoin', 'round')
    .attr('active', true)
    .attr("stroke-width", d => 8)
    .style('opacity', .85)
    // .attr("stroke-chartWidth", 1.5)
    .attr("id", d => d.key)
    .attr("d", function (d) {
      return d3.line()
        .x(d => x(d.year))
        .y(d => y(+d.count))
        // .curve(d3.curveCatmullRom)
        .curve(d3.curveStepBefore)
        (d.values)
    })

})

