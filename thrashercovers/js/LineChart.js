// set the dimensions and margins of the graph
var margin5 = {top: 5, right: window.innerWidth / 10,
 bottom: 70, left: window.innerWidth / 10},
    width5 = (window.innerWidth < 1000
        ? window.innerWidth / 1
        : window.innerWidth / 1.3) - (window.innerWidth / 10) - (window.innerWidth / 10);
    height5 = (window.innerHeight < 1000
      ? window.innerHeight / 3
      :window.innerHeight / 2.3) - 5;

 




// legendSpace = width/4;

// append the svg object to the body of the page
var svg5 = d3.select("#linechart")
  .append("svg")
    .attr("width", width5 + margin5.left + margin5.right)
    .attr("height", height5 + margin5.top + margin5.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin5.left + "," + margin5.top + ")");
//Read the data
d3.csv("data/barplot.csv", function(data) {
  

  // Add X axis
  var x = d3.scaleLinear()
    .domain([d3.min([1981,2021]),d3.max([1981,2021])])
    .range([ 0, width5 ]);
  svg5.append("g")
    .attr("transform", "translate(0," + height5 + ")")
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")))

    ;
    

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 12])
    .range([ height5, 0]);
  svg5.append("g")
    .call(d3.axisLeft(y).ticks(7).tickFormat(d3.format("d")));


  // Add dots
// svg5.append("path")
//       .datum(data)
//       .attr("fill", "none")
//       .attr("stroke", "green")
//       .attr("stroke-width", 1.5)
//       .attr("d", d3.line()
//         .x(function(d) { return x(d.year) })
//         .y(function(d) { return y(d.topstairs) })
//         )

svg5.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "mediumseagreen")
      .attr("stroke-width", 3)
      .attr("d", d3.line()
        .x(function(d) { return x(d.year) })
        .y(function(d) { return y(d.transition) })
        )
      .attr('pointer-events', 'visibleStroke')
      .on("mouseover", function(d) {
        d3.select(this).style("stroke-width", "6");
      })                  
      .on("mouseout", function(d) {
        d3.select(this).style("stroke-width", "3")   
      })

svg5.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 3)
      .attr("d", d3.line()
        .x(function(d) { return x(d.year) })
        .y(function(d) { return y(d.rail) })
        )
      .attr('stroke-width', '3')
      .attr('fill', 'none')
      .attr('pointer-events', 'visibleStroke')
      .on("mouseover", function(d) {
        d3.select(this).style("stroke-width", "6");
      })                  
      .on("mouseout", function(d) {
        d3.select(this).style("stroke-width", "3")   
      })

 svg5.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 3)
      .attr("d", d3.line()
        .x(function(d) { return x(d.year) })
        .y(function(d) { return y(d.ledge) })
        )
      .attr('stroke-width', '3')
      .attr('fill', 'none')
      .attr('pointer-events', 'visibleStroke')
      .on("mouseover", function(d) {
        d3.select(this).style("stroke-width", "6");
      })                  
      .on("mouseout", function(d) {
        d3.select(this).style("stroke-width", "3")   
      })

  svg5.append("circle").attr("cx",(width5-90)).attr("cy",10).attr("r", 5).style("fill", "red")
svg5.append("circle").attr("cx",width5-90).attr("cy",30).attr("r", 5).style("fill", "steelblue")
svg5.append("circle").attr("cx",width5-90).attr("cy",50).attr("r", 5).style("fill", "orange")
svg5.append("circle").attr("cx",width5-90).attr("cy",70).attr("r", 5).style("fill", "mediumseagreen")

svg5.append("text").attr("x", width5-80).attr("y", 10).text("ledges/hubbas").style("font-size", "0.8rem").attr("alignment-baseline","middle")
svg5.append("text").attr("x", width5-80).attr("y", 30).text("stairs/gaps").style("font-size", "0.8rem").attr("alignment-baseline","middle")
svg5.append("text").attr("x", width5-80).attr("y", 50).text("handrails").style("font-size", "0.8rem").attr("alignment-baseline","middle")
svg5.append("text").attr("x", width5-80).attr("y", 70).text("transition").style("font-size", "0.8rem").attr("alignment-baseline","middle")
svg5.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 3)
      .attr("d", d3.line()
        .x(function(d) { return x(d.year) })
        .y(function(d) { return y(d.gapstairs) })
        )
      .attr('pointer-events', 'visibleStroke')
      .on("mouseover", function(d) {
        d3.select(this).style("stroke-width", "6");
      })                  
      .on("mouseout", function(d) {
        d3.select(this).style("stroke-width", "3")   
      })




     // svg5.append("path")
     //  .datum(data)
     //  .attr("fill", "none")
     //  .attr("stroke", "hotpink")
     //  .attr("stroke-width", 3)
     //  .attr("d", d3.line()
     //    .x(function(d) { return x(d.year) })
     //    .y(function(d) { return y(d.flat) })
     //    )
     //  .attr('pointer-events', 'visibleStroke')
     //  .on("mouseover", function(d) {
     //    d3.select(this).style("stroke-width", "6");
     //  })                  
     //  .on("mouseout", function(d) {
     //    d3.select(this).style("stroke-width", "3")   
     //  })

 



  svg5.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.year); } )
      .attr("cy", function (d) { return y(d.transition); } )
      .attr("r", 2)
      .style("fill", "(0, 0, 0, 0.5)")

          .on('mouseover', function (d, i) {
         d3.select(this).transition()
              .duration('100')
              .attr("r", 6);
          tooltip2
              
          .style("opacity", 1)
          .transition(100)})


          .on('mousemove', function (d, i) {

     tooltip2
     // .transition()
     // .duration(100)
     .html("<img class='tooltipcover' src='covers/"+ 
        d.month + d.year + ".jpg'></img><br><br>" + 
        d.skater + ", " + d.month + " " + d.year)
      // .style("pointer-events", "none")
      .style("left", (d3.mouse(this)[0]+50) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("bottom", (d3.mouse(this)[1]/2) + "px")
})



.on('click', function (d, i) {
  // d3.select(this).transition()
  //         .duration('100')
  //         .attr("r", 10);

    tooltip2
    .style("opacity", "0")

     popup
     .style("width", "auto")
    .style("height","auto")
    .style("max-height","80%")
     .style("opacity", 1)
     .html("<img class='popupcover' src='covers/"+ 
        d.month + d.year + ".jpg'></img><br>" + d.skater + ", " + d.month + ", " + d.year)
      
      .style("left", "0") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", "-10%")
      .style("right", "0")
      .style("margin", "5%, auto")
      .style("z-index","1");

})


.on('mouseleave', function (d, i) {
      d3.select(this).transition()
      .duration('100')
      .attr("r",3);
     tooltip2
      .transition()
      .duration(200)
      .style("opacity", 0)

})

    svg5.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.year); } )
      .attr("cy", function (d) { return y(d.gapstairs); } )
      .attr("r", 2)
      .style("fill", "(0, 0, 0, 0.5)")

          .on('mouseover', function (d, i) {
         d3.select(this).transition()
              .duration('100')
              .attr("r", 6);
          tooltip2
              
          .style("opacity", 1)
          .transition(100)})


          .on('mousemove', function (d, i) {

     tooltip2
     // .transition()
     // .duration(100)
     .html("<img class='tooltipcover' src='covers/"+ 
        d.month + d.year + ".jpg'></img><br><br>" + 
        d.skater + ", " + d.month + " " + d.year)
      // .style("pointer-events", "none")
      .style("left", (d3.mouse(this)[0]+50) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("bottom", (d3.mouse(this)[1]/2) + "px")
})



.on('click', function (d, i) {
  // d3.select(this).transition()
  //         .duration('100')
  //         .attr("r", 10);

    tooltip2
    .style("opacity", "0")

     popup
     .style("width", "auto")
    .style("height","auto")
    .style("max-height","80%")
     .style("opacity", 1)
     .html("<img class='popupcover' src='covers/"+ 
        d.month + d.year + ".jpg'></img>" + d.skater + ", " + d.month + ", " + d.year)
      
      .style("left", "0") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", "-10%")
      .style("right", "0")
      .style("margin", "5%, auto")
      .style("z-index","1");

})


.on('mouseleave', function (d, i) {
      d3.select(this).transition()
      .duration('100')
      .attr("r",3);
     tooltip2
      .transition()
      .duration(200)
      .style("opacity", 0)

})

        svg5.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.year); } )
      .attr("cy", function (d) { return y(d.ledge); } )
      .attr("r", 2)
      .style("fill", "(0, 0, 0, 0.5)") 

      .on('mouseover', function (d, i) {
         d3.select(this).transition()
              .duration('100')
              .attr("r", 6);
          tooltip2
              
          .style("opacity", 1)
          .transition(100)})


          .on('mousemove', function (d, i) {

     tooltip2
     // .transition()
     // .duration(100)
     .html("<img class='tooltipcover' src='covers/"+ 
        d.month + d.year + ".jpg'></img><br><br>" + 
        d.skater + ", " + d.month + " " + d.year)
      // .style("pointer-events", "none")
      .style("left", (d3.mouse(this)[0]+50) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("bottom", (d3.mouse(this)[1]/2) + "px")
})



.on('click', function (d, i) {
  // d3.select(this).transition()
  //         .duration('100')
  //         .attr("r", 10);

    tooltip2
    .style("opacity", "0")

     popup
     .style("width", "auto")
    .style("height","auto")
    .style("max-height","80%")
     .style("opacity", 1)
     .html("<img class='popupcover' src='covers/"+ 
        d.month + d.year + ".jpg'></img>" + d.skater + ", " + d.month + ", " + d.year)
      
      .style("left", "0") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", "-10%")
      .style("right", "0")
      .style("margin", "5%, auto")
      .style("z-index","1");

})


.on('mouseleave', function (d, i) {
      d3.select(this).transition()
      .duration('100')
      .attr("r",3);
     tooltip2
      .transition()
      .duration(200)
      .style("opacity", 0)

})

      svg5.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.year); } )
      .attr("cy", function (d) { return y(d.rail); } )
      .attr("r", 2)
      .style("fill", "(0, 0, 0, 0.5)")  

    //    svg5.append('g')
    // .selectAll("dot")
    // .data(data)
    // .enter()
    // .append("circle")
    //   .attr("cx", function (d) { return x(d.year); } )
    //   .attr("cy", function (d) { return y(d.flat); } )
    //   .attr("r", 3)
    //   .style("fill", "black") 

})


.on('mouseleave', function (d, i) {
      d3.select(this).transition()
      .duration('100')
      .attr("r",3);
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

var tooltip2 = d3.select("#stairchart")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip2")
    .style("display", "inline-block")
    .style("background-color", "rgba(255, 255, 255, 0.9)")
    .style("max-width", "30%")
    .style("position", "fixed")
    .style("pointer-events", "none")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "3px")
    .style("padding", "15px")
    .style("text-transform", "capitalize")

var span = document.getElementsByClassName("close")[0];

var stairs = ['totalstairs', 'topstairs'];
 
var color = d3.scaleOrdinal()
     .domain(stairs)
     .range(['#e41a1c','#377eb8'])



     svg5.append("path")
       .datum(data)
       .attr("fill", "black")
       .attr("stroke", "black" )
       .attr("stroke-width", 4.5)
       .attr("d", d3.line()
        .x(function(d) { return d.year })
        .y(function(d) { return d.transition })
        )
 



var popup = d3.select("#linechart")
    .append("div")
    .style("opacity", "0")
    .attr("class", "popup")
    .style("display", "inline-block")
    .style("background-color", "rgba(255, 255, 255, 0.9)")
    .style("width", "0%")
    .style("height","0%")
    .style("margin", "10% auto")
    .style("left", "0")
    .style("top", "0")
    .style("position", "fixed")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "4px")
    .style("padding", "10px")
    .style("z-index", "0")
    .style("text-transform", "capitalize")


.on('click', function (d, i) {
  // d3.select(this).transition()
  //         .duration('100')
  //         .attr("r", 10);
     popup
     .style("opacity", "0")
     .style("width", "0%")
    .style("height","0%");


})

    




