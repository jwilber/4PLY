var USER_VIDEO = "101_Falling_Down";


function getValKey() {
    return "grp" + USER_VIDEO;
}

var VAL_KEY = getValKey();
var grp_vals = {};

var delay_per_unit = 30,
    bg_color = "#f7f6f1";

// Dimensions of single chart.
var margin = { top: 0, right: 0, bottom: 0, left: 6 },
    width = 134 - margin.left - margin.right,
    height = 134 - margin.top - margin.bottom; 
    



d3.csv("data/square_pie.csv", type, function(error, data) {
    if (error) throw error;

    

    var valfields = d3.keys(field_details);
    
    // Make data accessible by grp key
    data.forEach(function(o) {
        grp_vals["grp" + o.video] = o;
    });
    

    //
    // Setup grid.
    //
    var cells = [];
    d3.select("#grid").text().split("\n").forEach(function(line, i) {
      var re = /\w+/g, m;
      while (m = re.exec(line)) cells.push({
        name: m[0],
        selected: 1,
        x: m.index / 3,
        y: i
      });
    });


    //
    // Make a square pie for each field.
    //
    valfields.forEach(function(v,i) {
        var grid_width = d3.max(cells, function(d) { return d.x; }) + 2,
            grid_height = d3.max(cells, function(d) { return d.y; }) + 2,
            cell_size = width / grid_width,
            holder_width = width + margin.left + margin.right;

            
        let chart_perc = grp_vals[VAL_KEY][v];


        // create chartholder
        var div = d3.select("#charts").append("div")
            .attr("id", "holder"+v)
            .attr("class", "chartholder")
            .style("width", holder_width+"px");

        // add h3 for each chart
        div.append("h3")
            .attr('class', 'h3title')
            .append('text')
            .text(`${field_details[v].desc}: ${chart_perc}%`);
    
        // add svg
        var svg = div.append("svg")
            .attr("class", "squarepie")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var cell = svg.append("g")
            .attr("id", "vf"+v)
            .attr("transform", "translate(" + width/2 + "," + height/2 + ")")
          .selectAll(".cell")
            .data(cells)
          .enter().append("g")
            .attr("class", "cell")
            .attr("transform", function(d) { 
                return "translate(" + (d.x-grid_width/2) * cell_size + "," + (d.y-grid_height/2) * cell_size + ")"; 
            });


        // cell.append("circle")
        //     .attr("x", -cell_size / 2)
        //     .attr("y", -cell_size / 2)
        //     .attr('r', cell_size * 0.5)
        //     .attr('stroke', 'grey')
        //     .attr('stroke-width', 0.5)
        //     .style("fill", function(d,i) {
        //         if (i < (100-grp_vals[VAL_KEY][v])) {
        //             return bg_color;
        //         } else {
        //             return field_details[v].color;
        //         }
        //     });

        cell.append("rect")
            .attr("x", -cell_size / 2)
            .attr("y", -cell_size / 2)
            .attr('width', cell_size)
            .attr('height', cell_size)
            .attr('stroke', 'grey')
            .attr('stroke-width', 0.5)
            .style("fill", function(d,i) {
                if (i < (100-grp_vals[VAL_KEY][v])) {
                    return bg_color;
                } else {
                    return field_details[v].color;
                }
            });


        // d3.select(`#holder${v}`)
        //     .append('g')
        //     .attr('transform', 'translate(1000, 100')
        //     .append("p")
        //     .attr('class', 'squareText')
        //     .attr("id", "myNewParagrap")
        //     .append("text")
        //     .text(`${chart_perc}%`)
        //     .style('padding-top', 0)
        //     .style('margin-top', 0)
    
    }); // @end forEach()
    
    
    d3.select("#charts").append("div").attr("class", "clr");
        
    

    //
    // Group selection with buttons
    //
    d3.selectAll("#percentages .button").on("click", function() {
        USER_VIDEO = d3.select(this).attr("data-val");
        d3.select("#percentages .current").classed("current", false);
        d3.select(this).classed("current", true);
        update();
    });
    
    
    // 
    // Update based on current group
    //
    function update() {
    
        var prev_val_key = VAL_KEY;
        VAL_KEY = getValKey();
                
        // Update charts.
        valfields.forEach(function(v,k) {
            
            var start_i = 100 - grp_vals[prev_val_key][v];
            var end_i = 100 - grp_vals[VAL_KEY][v];
            let new_perc = grp_vals[VAL_KEY][v];

            // update title
            d3.select(`#holder${v}`)
                .select("h3")
                .transition()
                // .delay(800)
            .text(`${field_details[v].desc}: ${new_perc}%`);

            // d3.select(`#holder${v}`)
            //     .select("#myNewParagrap")
            //     .transition()
            //     .delay(900)
            // .text(`${new_perc}%`)
            // .style('padding-top', 0)
            // .style('margin-top', 0)
            // // .style('font-size', '1.2rem')
                
            
            d3.select("#vf"+v).selectAll(".cell rect")
                .transition()
                .duration(750)
                .delay(function(d,i) {
                    
                    // Decreasing
                    if (start_i < end_i) {
                        var curr_delay = (i - start_i) * delay_per_unit;
                        curr_delay = Math.max(curr_delay, 0);
                        return curr_delay;
                    } 
            
                    // Increasing
                    else if (start_i > end_i) {
                        var curr_delay = (start_i - i) * delay_per_unit;
                        curr_delay = Math.max(curr_delay, 0);
                        return curr_delay;
                    }
            
                    // No change.
                    else {
                        return 0;
                    }
                })
                .style("fill", function(d,i) {
                    if (i < (100-grp_vals[VAL_KEY][v])) {
                        return bg_color;
                    } else {
                        return field_details[v].color;
                    }
                })

        }); // @end forEach()
        
    } // @end update()
    
    
    
    
}); // @end d3.tsv()



function type(d) {
    d3.keys(d).map(function(key) {
        if (key !== "video") {
            d[key] = +d[key];
        }
    });
    
    return d;
}