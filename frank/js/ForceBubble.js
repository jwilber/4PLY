// set the dimensions and margins of the graph

const chartDims = d3.select("#my_datavis").node().getBoundingClientRect();
const barMargin = {
  top: chartDims.width < 500 ? 20 : 10,
  right: chartDims.width < 500 ? 20 : 40,
  bottom: chartDims.width < 500 ? 30 : 40,
  left: chartDims.width < 500 ? 40 : 55,
};
const barWidth = chartDims.width - barMargin.left - barMargin.right;
const barHeight = window.innerHeight * 0.9 - barMargin.top - barMargin.bottom;
const maxRadius = window.innerWidth < 600 ? 35 : 55;
const fontMin = window.innerWidth < 600 ? 5 : 9;
const fontMax = window.innerWidth < 600 ? 16 : 22;

// append the svg object to the body of the page
let svg = d3
  .select("#my_datavis")
  .append("svg")
  .attr("width", barWidth + barMargin.left + barMargin.right)
  .attr("height", barHeight + barMargin.top + barMargin.bottom)
  .append("g")
  .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")");

// Parse the Data
d3.csv("data/toptricks2.csv", function (data) {
  // define axes

  const max_count = d3.max(data, (d) => +d.count);
  const yScale = d3
    .scaleLinear()
    .domain([0, max_count + 2])
    .range([barHeight, barMargin.bottom])
    .clamp(true);

  // add axis
  const yAxis = d3
    .axisLeft(yScale)
    .tickSize(-barWidth)
    // .tickSizeOuter(barWidth)
    .ticks(5);
  svg
    .append("g")
    .attr("id", "y-axis-force")
    .call(yAxis)
    .style("transform", `translate(${barMargin.left},0)`);

  const rScale = d3.scaleSqrt().domain([1, max_count]).range([4, maxRadius]);
  const fontSizeScale = d3
    .scaleLinear()
    .domain([1, max_count])
    .range([fontMin, fontMax]);
  const force = d3
    .forceSimulation(data)
    .force("forceX", d3.forceX(barWidth / 2).strength(0.05))
    .force("forceY", d3.forceY((d) => yScale(+d.count)).strength(0.2))
    .force(
      "collide",
      d3.forceCollide((d) => rScale(+d.count) + 5.5)
    )
    .stop();

  const NUM_ITERATIONS = 300;

  for (let i = 0; i < NUM_ITERATIONS; ++i) {
    force.tick();
  }

  force.stop();

  const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

  const cells = svg
    .selectAll("g.cell")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "cell")
    .attr("cell-index", (d, i) => i)
    .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

  cells
    .append("circle")
    .attr("r", (d) => rScale(+d.count))
    .style("fill", "rgb(248, 209, 6)")
    .attr("stroke", "black")
    .attr("stroke-width", 2);

  cells
    .append("text")
    .attr("class", "trick-name")
    .text((d) => d.trick)
    .attr("text-anchor", "middle")
    .attr("font-family", "Bungee")
    .each(function (d) {
      const bbox = this.getBBox();
      d.textWidth = bbox.width;
      d.jitter = random(-6, 7);
    })
    .style("font-size", (d) => `${fontSizeScale(+d.count)}px`)
    .attr("dy", (d) => d.jitter)
    .append("tspan")
    .text((d) => `${d.count}`)
    .style("font-size", (d) => `${d.scale}px`)
    .attr("x", 0)
    .attr("dy", (d) => (+d.count < 7 ? 12 : rScale(+d.count / 3)))
    .attr("text-anchor", "middle");

  d3.selectAll("text.trick-name").raise();

  cells
    .on("mouseover", function (d, i) {
      //   raise current element
      const currCircle = d3.select(this);
      const currIndex = d3.select(this).attr("cell-index");

      currCircle.raise();
      currCircle.select("circle").attr("stroke-width", 4);
      currCircle.selectAll("text").style("stroke-width", 5);

      d3.selectAll("g.cell")
        .filter(function () {
          return d3.select(this).attr("cell-index") != currIndex;
        })
        .attr("opacity", 0.35);
    })
    .on("mouseout", function (d, i) {
      //   raise current element
      const currCircle = d3.select(this);
      const currIndex = d3.select(this).attr("cell-index");

      currCircle.raise();
      currCircle.select("circle").attr("stroke-width", 4);
      currCircle.selectAll("text").style("stroke-width", 5);

      d3.selectAll("g.cell").attr("opacity", 1);
      d3.selectAll("g.cell").select("circle").attr("stroke-width", 2);
      d3.selectAll("g.cell").selectAll("text").style("stroke-width", 2.5);
    });
});
