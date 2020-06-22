// set the dimensions and lineMargins of the graph
let lineMargin = { top: 10, right: 30, bottom: 60, left: 100 },
  chartWidth = 800 - lineMargin.left - lineMargin.right,
  chartHeight = 500 - lineMargin.top - lineMargin.bottom;

// append the svg object to the body of the page
const obstaclesChart = d3.select("#obstacles")
  .append("svg")
  .attr('id', 'lineSvg')
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", `0 0 ${(chartWidth + lineMargin.left + lineMargin.right)}
    ${(chartHeight + lineMargin.top + lineMargin.bottom)}`)
  .append("g")
  .attr("transform",
    "translate(" + lineMargin.left + "," + lineMargin.top + ")");

d3.select('#lineSvg')
  .append('text')
  .attr('x', (chartWidth + lineMargin.right) / 2.5)
  .attr('y', lineMargin.top *2)
  .html("# Tricks Filmed By Obstacle")
  .style('font-family', "Bungee Inline")
  .style('font-size', '1rem')

// add x-axis
d3.select('#lineSvg')
  .append("text")    
  .attr('x', (chartWidth + lineMargin.right + lineMargin.left) / 2)  
  .attr('y', chartHeight + lineMargin.top + 50)       
  .style("text-anchor", "left")
  .style('font-family', "Bungee")
  .style('font-size', '.2rem')
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
d3.csv("data/timeseries.csv", function (data) {

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
    .attr("stroke-width", d => 14)
    .style('opacity', .85)
    .attr("stroke-chartWidth", 1.5)
    .attr("id", d => d.key)
    .attr("d", function (d) {
      return d3.line()
        .x(d => x(d.year))
        .y(d => y(+d.count))
        // .curve(d3.curveCardinal.tension(1.5))
        (d.values)
    })
    .on("click", function(d){
      let cur_sel = d.key;
      let activeEl = d3.select(`#${cur_sel}`).attr('active');
      // determine if current line is visible
      let active = (activeEl == 'true') ? false : true;
      let newOpacity = active ? 1 : 0;
      // hide or show the elements
      d3.select(`#${cur_sel}`).style("opacity", newOpacity);
      // update whether or not the elements are active
      d3.select(`#${cur_sel}`).attr('active', active);
    });


  // interactivity
    d3.selectAll('path.ts')
      .on('mouseover', highlightLine);
    d3.selectAll('path.ts')
      .on('mouseout', deHighlightLine);

    function highlightLine(d) {
      let col = d3.select(this).attr('stroke');
      let sw = d3.select(this).attr('stroke-width');
      // d3.select(this).attr('stroke', d3.rgb(col).brighter(.2));
      d3.select(this).attr('stroke-width', 15);
    };

    function deHighlightLine(d) {
      let col = d3.select(this).attr('class');
      let sw = d3.select(this).attr('stroke-width');
      // d3.select(this).attr('stroke', colDict[col]);
      d3.select(this).attr('stroke-width', 12);
    };

const colDict = {Ledges: 'teal', Handrails: 'orange' , 'Stairs/Gaps': '#e9778b'}

// legend
var legend_keys = ["Ledges", "Handrails", "Stairs/Gaps"]

var lineLegend = obstaclesChart.selectAll(".lineLegend")
    .data(legend_keys)
    .enter().append("g")
    .attr("class","lineLegend")
    .attr("transform", function (d,i) {
            return "translate(" + (chartWidth - lineMargin.left) + "," + (i*20)+")";
        });

lineLegend.append("text").text(function(d) {
  return d
})
    .attr("transform", "translate(15, 6)")
    .on("click", function(d){
      let cur_sel;
      if (d == "Stairs/Gaps") {
        cur_sel = "stairs"
      } else if (d == "Handrails") {
        cur_sel = "handrail"
      } else {
        cur_sel = "ledge"
      };
      let activeEl = d3.select(`#${cur_sel}`).attr('active');
      // determine if current line is visible
      let active = (activeEl == 'true') ? false : true;
      let newOpacity = active ? 1 : 0;
      // hide or show the elements
      d3.select(`#${cur_sel}`).style("opacity", newOpacity);
      // update whether or not the elements are active
      d3.select(`#${cur_sel}`).attr('active', active);
    });

lineLegend.append("rect")
    .attr("fill", d => colDict[d])
    .attr("width", 12).attr('height', 5)
    .on("click", function(d){
      let cur_sel;
      if (d == "Stairs/Gaps") {
        cur_sel = "stairs"
      } else if (d == "Handrails") {
        cur_sel = "handrail"
      } else {
        cur_sel = "ledge"
      };
      let activeEl = d3.select(`#${cur_sel}`).attr('active');
      // determine if current line is visible
      let active = (activeEl == 'true') ? false : true;
      let newOpacity = active ? 1 : 0;
      // hide or show the elements
      d3.select(`#${cur_sel}`).style("opacity", newOpacity);
      // update whether or not the elements are active
      d3.select(`#${cur_sel}`).attr('active', active);
    });

})

