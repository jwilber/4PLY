// set the dimensions and margins of the graph
var barMargin = { top: 10, right: window.innerWidth/8, bottom: 100, left: window.innerWidth/4 }
var barWidth = window.innerWidth/1.15 - barMargin.left - barMargin.right;
const barHeight = window.innerHeight/1.1 - barMargin.top - barMargin.bottom;
console.log('we in')

function myFunction(isMobile) {
  if (isMobile.matches) { // If media query matches
    barWidth.left = window.innerWidth/1.15 - barMargin.left - barMargin.right;
  } else {
    barWidth = window.innerWidth/1.4 - barMargin.left - barMargin.right;
    barMargin.left = window.innerWidth/3.5;
  }
}

var isMobile = window.matchMedia("(max-width: 900px)")
myFunction(isMobile) // Call listener function at run time
isMobile.addListener(myFunction) // Attach listener function on state changes

// append the svg object to the body of the page
let svg = d3.select("#my_interactivedatavis")
  .append("svg")
  .attr("width", barWidth + barMargin.left + barMargin.right)
  .attr("height", barHeight + barMargin.top + barMargin.bottom)
  // .attr("preserveAspectRatio", "xMinYMin meet")
  // .attr("viewBox", `0 0 ${(barWidth + barMargin.left + barMargin.right)}
    // ${(barHeight + barMargin.top + barMargin.bottom)}`)
  .append("g")
  .attr("transform",
    "translate(" + barMargin.left + "," + barMargin.top + ")");

 



drawog()
function drawog() {
// Parse the Data
d3.csv("data/topgroupedobstacle.csv", function (data) {
// find max cnt of obstacle for x axis
let obstacletricks = data.filter(function(d){ return d.obstacle == "rail" })
 let trickByObstacle3 = d3.nest()
  .key(function(d) { return d.obstacle; })
  .rollup(function(leaves){
        return d3.sum(leaves, function(d) {return (d.cnt)});})
  .entries(data)


  document.getElementById("section-header").innerHTML = 'Top Tricks';
  console.log(trickByObstacle3)

  // Add X axis
  let x = d3.scaleLinear()
    .domain([0, (d3.max(trickByObstacle3, function(d) { return +d.value; }))])
    .range([0, barWidth]);


  let xAxis = d3.axisBottom(x).tickSize(0);
  svg.append("g")
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${barHeight})`)
    .call(xAxis)

  // Y axis
  let y = d3.scaleBand()
    .range([0, barHeight])
    .domain(data.map(d => d.obstacle))
    .padding(.2);

    // y axis titles
  svg.append("g")
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y))
      .style('font-size', '.8rem')

// select gap tricks
// let obstacletricks = data.filter(function(d){ return d.obstacle == "gap" })
// console.log(obstacletricks)



// d3.max(obstacletricks, function(d) { return +d.cnt; })

console.log(d3.sum(obstacletricks, function(d) { return +d.cnt; }))
console.log(obstacletricks)



let trickByObstacle = d3.nest()


  .key(function(d) { return d.obstacle; })

  .rollup(function(leaves){
        return d3.sum(leaves, function(d) {return (d.cnt)});
      })
  .entries(data)

  console.log(trickByObstacle);

 
// potential filter to get the key?
 // console.log(trickByObstacle.filter(function(d){ return }))

let trickByObstacle2 = d3.nest()

  
  .key(function(d) { return d.obstacle; })

  .key(function(d){
    return d.trick;
  })

  .rollup(function(leaves){
        return d3.sum(leaves, function(d) {return (d.cnt)});
    })
  .entries(data)


  console.log(trickByObstacle2)

  console.log((d3.values(d3.values(trickByObstacle))))



let trickmap = d3.map(trickByObstacle2)

console.log(trickmap)

console.log(trickmap.get(1))

let map = (trickmap.values())
  

console.log(map)



console.log(map.entries())

// console.log(d3.map([trickmap[ function(trickmap) { return d.key}]]))


// could be useful
// console.log(trickmap.each(function))



  svg.append("g")
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y))
    .style('font-size', '.8rem')



  //Bars
  svg.selectAll("myRect")
    .data(trickByObstacle)
    .enter()
    .append("rect")
    .attr("class","bar")
    .attr("x", 0)
    .attr("y", function(d) { return y(d.key); })
    .attr("obstacle", function(d) { return (d.key); })


    .transition().delay(function (d, i) { return i * 80; })
            .duration(600)

    // data.filter(function(d){ return d.obstacle == "rail" })
    .attr("width", function(d) {return x(d.value); })

    .attr("height", (y.bandwidth()))
    .attr('fill', "rgb(155, 28, 49)")
    // console.log("here")
    .style('stroke', 'rgb(155, 28, 49)')
    .style('stroke-width', 7)



    // svg.append("g")
      // .call(d3.axisLeft(y));

  // text label for the y axis
    // svg.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 0 - barMargin.left/2)
    //     .attr("x",0 - (barHeight / 2))
    //     .attr("dy", "1em")
    //     .style("text-anchor", "middle")
    //     .style('font-family', "Bungee")
    //     .style('font-size', '1rem')
    //     .text("obstacle"); 


// add x-axis
d3.select('svg')
  .append("text")
  .attr('x', (barWidth + barMargin.left) / 2)
  .attr('y', barHeight + barMargin.top + 40)
  // .style("text-anchor", "left")
  .style('font-family', "Bungee")
  .style('font-size', '1rem')
  .text("total tricks by obstacle");

    d3.selectAll("rect")
    .on('click',function() {
        console.log("mouseClick")
        // console.log(d3.select(this).property("obstacle"))
          // console.log(d3.select(this).node().trick)
          // let selection = d3.select("dataFilter").property("trick")
          // console.log(trickByObstacle.property.obstacle[1])
          var selectedOption = d3.select(this).attr("obstacle")
          console.log(selectedOption)

          document.getElementById("section-header").innerHTML = 'Top ' + selectedOption + ' Tricks'; 
          // console.log(selection)
          d3.selectAll("rect")
            .remove();

            // remove text
          d3.selectAll("text")
            .remove();

          d3.selectAll("g.tick")
            .remove();

          // console.log(d3.select("myRect").attr("y"))
            // redraw();
          redraw(selectedOption);
            // remove ticks and axis
      })



  })
        function redraw(selectedObstacle) {
  console.log(selectedObstacle)


  d3.csv("data/topbytrick.csv", function (data) {


    let dataFilter = [];
      for (let i = 0; i < data.length; i++) {
          if (data[i].obstacle == selectedObstacle) {
              dataFilter.push(data[i]);
          }
      }

    console.log(dataFilter)

    // let dataFilter = data.filter(function(d){return d.obstacle==selectedObstacle})

    // console.log(dataFilter)
// find max cnt of obstacle for x axis
  let obstacletricks = data.filter(function(d){ return d.obstacle == "rail" })

  var allObstacle = d3.map(data, function(d){return(d.obstacle)}).keys()

  var railObstacle = d3.map(data, function(d){return(d.obstacle == "rail")}).keys()

  console.log(allObstacle)
  console.log(obstacletricks)


  // Add X axis
  let x = d3.scaleLinear()
    .domain([0, (d3.max(dataFilter, function(d) { return +d.cnt; }))])
    .range([0, barWidth]);



  let xAxis = d3.axisBottom(x).tickSize(0);
  svg.append("g")
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${barHeight})`)
    .call(xAxis)

  let railmap = data.filter(function(d){ return d.obstacle == "rail" })

  // Y axis
  let y = d3.scaleBand()
    .range([0, barHeight])
    .domain(dataFilter.map(d => (d.trick)))
    .padding(.7)



// console.log(((data.map(d => (d.trick)))))


    svg.append("g")
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y))
        .style('font-size', '.8rem')

      // The function returns the product of p1 and p2

      
    console.log(obstacletricks)
    console.log(d3.set([obstacletricks]).size())

// select gap tricks
// let obstacletricks = data.filter(function(d){ return d.obstacle == "gap" })
// console.log(obstacletricks)

// obstacletricks.filter(function(d){ return d3.sum(d.cnt)})

  // label for y axis
  // svg.append("text")
  //     .attr("transform", "rotate(-90)")
  //     .attr("y", 0 - barMargin.left/1)
  //     .attr("x",0 - (barHeight / 2))
  //     .attr("dy", "1em")
  //     .style("text-anchor", "middle")
  //     .style('font-family', "Bungee")
  //     .style('font-size', '1rem')
  //     .text("trick"); 


  // add x axis label



  svg.selectAll("myRect")
    .data(dataFilter)

    .enter()

    // .data(obstacletricks.filter(function(d){return d.obstacle === "rail"}))
    .append("rect")
    .attr("class","bar")
    .attr("x", 0)
    .attr("y", function(d) { return (y(d.trick)) })
    // .transition(500)
    // .duration(500)
    // .ease(d3.easeLinear)
    .attr("width", function(d) { return x(d.cnt)})
    
    .attr("height", (y.bandwidth()))
    
    
    .attr('fill', "rgb(155, 28, 49)")
    .style('stroke', 'rgb(155, 28, 49)')
    .style('stroke-width', 7)

    .on('click',function() {
        console.log("mouseClick")
          // change colour of tags
          d3.selectAll("rect")
            .remove();

            // remove text
        d3.selectAll("text")
            .remove();

            d3.selectAll("g.tick")
            .remove();


          drawog();
            // todo: remove ticks and axis
      })

})}}

  //   .on('mouseover',function(){
  //     console.log("mouseover");
  //     d3.select(this)
  //       .attr("height", (y.bandwidth()+5))

  //             })

  //   .on('mouseout',function () {
  //       d3.select(this)
  //           .attr('height', (y.bandwidth()))
  //   })
  // })


// add title


// svg.selectAll("myRect")
// .on('click',function() {
//         console.log("mouseClick")
//           // change colour of tags
//         d3.selectAll("rect")
//             .remove();

//             // remove text
//         d3.selectAll("text")
//             .remove();

//             // remove ticks and axis
//         d3.select("g.x-axis")
//             .remove();
// })
