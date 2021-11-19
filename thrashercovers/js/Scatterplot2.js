// set the dimensions and margins of the graph
var margin2 = {top: 5, right: window.innerWidth / 10,
 bottom: 70, left: window.innerWidth / 10},
    width2 = (window.innerWidth < 1000
        ? window.innerWidth / 1.2
        : window.innerWidth / 1.3) - (window.innerWidth / 10) - (window.innerWidth / 10);
    height2 = window.innerHeight / 2 - 75;




// legendSpace = width/4;

// append the svg object to the body of the page
var svg2 = d3.select("#scatterplot")
  .append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin2.left + "," + margin2.top + ")");
//Read the data
d3.csv("data/obstacle_year.csv", function(data) {
  

  // Add X axis
  var x = d3.scaleLinear()
    .domain([1981,2021])
    .range([ 0, width2 ]);
  svg2.append("g")
    .attr("transform", "translate(0," + height2 + ")")
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")))

    ;
    

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 12])
    .range([ height2, 0]);
  svg2.append("g")
    .call(d3.axisLeft(y).ticks(7).tickFormat(d3.format("d")));


  // Add dots
// svg2.append("path")
//       .datum(data)
//       .attr("fill", "none")
//       .attr("stroke", "green")
//       .attr("stroke-width", 1.5)
//       .attr("d", d3.line()
//         .x(function(d) { return x(d.year) })
//         .y(function(d) { return y(d.topstairs) })
//         )
// var hubbas = d3.filter(function(d) { return d.obstacle == "ledge" })
      
var hubbas = data.filter(function(d){ return d.obstacle == "ledge" });
var handrails = data.filter(function(d){ return d.obstacle == "rail" });
var stairs = data.filter(function(d){ return d.obstacle == "stairs" });
var transition = data.filter(function(d){ return d.obstacle == "transition" });
var gap = data.filter(function(d){ return d.obstacle == "gap" });
var flat = data.filter(function(d){ return d.obstacle == "flat" });

svg2.append("path")
      .datum(hubbas)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 3)
       // 
      .attr("d", d3.line()
        .x(function(d) { return x(d.year) })
        .y(function(d) { return y(d.cnt) })
        )
      .attr('pointer-events', 'visibleStroke')
      .on("mouseover", function(d) {
        d3.select(this).style("stroke-width", "6");
      })                  
      .on("mouseout", function(d) {
        d3.select(this).style("stroke-width", "3")   
      })

svg2.append("path")
      .datum(gap)
      .attr("fill", "none")
      .attr("stroke", "purple")
      .attr("stroke-width", 3)
       // 
      .attr("d", d3.line()
        .x(function(d) { return x(d.year) })
        .y(function(d) { return y(d.cnt) })
        )
      .attr('pointer-events', 'visibleStroke')
      .on("mouseover", function(d) {
        d3.select(this).style("stroke-width", "6");
      })                  
      .on("mouseout", function(d) {
        d3.select(this).style("stroke-width", "3")   
      })

svg2.append("path")
      .datum(flat)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 3)
       // 
      .attr("d", d3.line()
        .x(function(d) { return x(d.year) })
        .y(function(d) { return y(d.cnt) })
        )
      .attr('pointer-events', 'visibleStroke')
      .on("mouseover", function(d) {
        d3.select(this).style("stroke-width", "6");
      })                  
      .on("mouseout", function(d) {
        d3.select(this).style("stroke-width", "3")   
      })

svg2.append("path")
      .datum(handrails)
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 3)
       // 
      .attr("d", d3.line()
        .x(function(d) { return x(d.year) })
        .y(function(d) { return y(d.cnt) })
        )
      .attr('pointer-events', 'visibleStroke')
      .on("mouseover", function(d) {
        d3.select(this).style("stroke-width", "6");
      })                  
      .on("mouseout", function(d) {
        d3.select(this).style("stroke-width", "3")   
      })

svg2.append("path")
      .datum(stairs)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 3)
       // 
      .attr("d", d3.line()
        .x(function(d) { return x(d.year) })
        .y(function(d) { return y(d.cnt) })
        )
      .attr('pointer-events', 'visibleStroke')
      .on("mouseover", function(d) {
        d3.select(this).style("stroke-width", "6");
      })                  
      .on("mouseout", function(d) {
        d3.select(this).style("stroke-width", "3")   
      })

svg2.append("path")
      .datum(transition)
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 3)
       // 
      .attr("d", d3.line()
        .x(function(d) { return x(d.year) })
        .y(function(d) { return y(d.cnt) })
        )
      .attr('pointer-events', 'visibleStroke')
      .on("mouseover", function(d) {
        d3.select(this).style("stroke-width", "6");
      })                  
      .on("mouseout", function(d) {
        d3.select(this).style("stroke-width", "3")   
      })



//   svg2.append("circle").attr("cx",(width2-90)).attr("cy",10).attr("r", 5).style("fill", "red")
// svg2.append("circle").attr("cx",width2-90).attr("cy",30).attr("r", 5).style("fill", "steelblue")
// svg2.append("circle").attr("cx",width2-90).attr("cy",50).attr("r", 5).style("fill", "orange")
// svg2.append("text").attr("x", width2-80).attr("y", 10).text("hubbas").style("font-size", "0.8rem").attr("alignment-baseline","middle")
// svg2.append("text").attr("x", width2-80).attr("y", 30).text("handrails").style("font-size", "0.8rem").attr("alignment-baseline","middle")
// svg2.append("text").attr("x", width2-80).attr("y", 50).text("stairs").style("font-size", "0.8rem").attr("alignment-baseline","middle")

 



  svg2.append('g')
    .selectAll("dot")
    .data(data)

    .enter()
    // .filter(function(d) { return d.obstacle == "ledge" })
    .append("circle")
      .attr("cx", function (d) { return x(d.year); } )
      .attr("cy", function (d) { return y(d.cnt); } )
      .attr("r", 3)
      .style("fill", "black")  

      //add lines
  
    
      // .attr("cx", function (d) { return x(d.year); } )
      // .attr("cy", function (d) { return y(d.topstairs); } )
  
    

    .on('mouseover', function (d, i) {
     d3.select(this).transition()
          .duration('100')
          .attr("r", 10);
      tooltip2
          
      .style("opacity", 1)
      .transition(100);
})

// var cover = (d.topmonth + topyear + ".jpg")



.on('mouseleave', function (d, i) {
      d3.select(this).transition()
      .duration('100')
      .attr("r",5);
     tooltip2
      .transition()
      .duration(200)
      .style("opacity", 0)

})

// function mouseover(d) {
//     tooltip2
//       .style("opacity", 1)
//       d3.select(this).transition()
//           .duration('100')
//           .attr("r", 7);
//   }


var span = document.getElementsByClassName("close")[0];

var stairs = ['totalstairs', 'topstairs'];
 




})

    




