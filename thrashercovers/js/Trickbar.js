// set the dimensions and margins of the graph
var barMargin = {top: 5, right: window.innerWidth / 3,
 bottom: 70, left: window.innerWidth / 7},
    barWidth = (window.innerWidth < 1000
        ? window.innerWidth / 1.2
        : window.innerWidth / 1.3) - (window.innerWidth / 6) - (window.innerWidth / 7);
    barHeight = window.innerHeight / 1.2;


// const barMargin = { top: 10, right: window.innerWidth/7, bottom: 50, left: window.innerWidth/3.5 }
// const barWidth = window.innerWidth/1.3 - barMargin.left - barMargin.right
// const barHeight = window.innerHeight/0.9 - barMargin.top - barMargin.bottom;
console.log('we in')

// append the svg object to the body of the page
let svg = d3.select("#my_datavis")
  .append("svg")

  .attr("width", barWidth + barMargin.left + barMargin.right)
  .attr("height", barHeight + barMargin.top + barMargin.bottom)
  // .attr("preserveAspectRatio", "xMinYMin meet")
  // .attr("viewBox", `0 0 ${(barWidth + barMargin.left + barMargin.right)}
    // ${(barHeight + barMargin.top + barMargin.bottom)}`)
  .append("g")
  .attr("transform",
    "translate(" + barMargin.left + "," + barMargin.top + ")");
// svg.append("filter")
//     .attr("id", "frog")
//     .attr("filterUnits", "userSpaceOnUse")
//     .attr("x", -5)
//     .attr("y", -5)
//     .attr("width", "100%")
//     .attr("height", "100%")
//     .call((f) =>
//       f
//         .append("feTurbulence")
//         .attr("type", "fractalNoise")
//         .attr("baseFrequency", "0.4")
//         .attr("result", "noise")
//     )
//     .call((f) =>
//       f
//         .append("feDisplacementMap")
//         .attr("scale", "4")
//         .attr("xChannelSelector", "R")
//         .attr("yChannelSelector", "G")
//         .attr("in", "SourceGraphic")
//         .attr("in2", "noise")
//     );

// const filter = "url(#frog)";
// Parse the Data
d3.csv("data/toptricks.csv", function (data) {
  // Add X axis
  let x = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d.count)])
    .range([0, barWidth]);

  let xAxis = d3.axisBottom(x).tickSize(0);
  svg.append("g")
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${barHeight})`)
    .call(xAxis)

  // Y axis
  let y = d3.scaleBand()
    .range([0, barHeight])
    .domain(data.map(d => d.trick))
    .padding(.25);

  svg.append("g")
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y))
    .style('font-size', '.8rem')

  //Bars
  svg.selectAll("myRect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", x(0))
    .attr("y", d => y(d.trick))
    .attr("width", d => x(d.count))
    .attr("height", y.bandwidth())
    .attr('fill', "pink")
    .style('stroke', 'black')
    .style('stroke-width', 1.5)
    .attr("filter", filter)

})

// add title
d3.select('svg')
  .append('text')
  .attr('x', (barWidth) / 2)
  .attr('y', barMargin.top / 1.1)
  .style('font-family', "Bungee")
  .style('font-size', '1.2rem')

// add x-axis
d3.select('svg')
  .append("text")
  .attr('x', (barWidth + barMargin.left) / 2)
  .attr('y', barHeight + barMargin.top + 40)
  // .style("text-anchor", "left")
  .style('font-family', "Bungee")
  .style('font-size', '1rem')
  .text("");
