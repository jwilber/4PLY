// set the dimensions and margins of the graph
const barMargin = {
  top: 0,
  right: window.innerWidth < 700 ? 100 : 10000,
  bottom: 40,
  left: window.innerWidth / 4,
};
const barWidth = window.innerWidth * 0.38;
const barHeight = window.innerHeight / 1.2 - barMargin.top - barMargin.bottom;
console.log("we in");

// append the svg object to the body of the page
let svg = d3
  .select("#my_datavis")
  .append("svg")
  .attr("width", barWidth + barMargin.left + barMargin.right)
  .attr("height", barHeight + barMargin.top + barMargin.bottom)
  .append("g")
  .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")");

// Parse the Data
d3.csv("data/toptricks.csv", function (data) {
  // Add X axis
  let x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => +d.count)])
    .range([0, barWidth]);

  let xAxis = d3.axisBottom(x).tickSize(0);
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${barHeight})`)
    .call(xAxis);

  // Y axis
  let y = d3
    .scaleBand()
    .range([0, barHeight])
    .domain(data.map((d) => d.trick))
    .padding(0.2);

  svg
    .append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y))
    .style("font-size", ".7rem");

  //Bars
  svg
    .selectAll("myRect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", x(0))
    .attr("y", (d) => y(d.trick))
    .attr("width", (d) => x(d.count))
    .attr("height", y.bandwidth())
    .attr("fill", "rgb(248, 209, 6)")
    .style("stroke", "black")
    .style("stroke-width", 2);
});

// add title
d3.select("svg")
  .append("text")
  .attr("x", barWidth / 20)
  .attr("y", barMargin.top / 20)
  .style("font-family", "Bungee")
  .style("font-size", "1.2rem");

// add x-axis
d3.select("svg")
  .append("text")
  .attr("x", (barWidth + barMargin.left) / 2)
  .attr("y", barHeight + barMargin.top)
  // .style("text-anchor", "left")
  .style("font-family", "Bungee")
  .style("font-size", "1rem")
  .text("");
