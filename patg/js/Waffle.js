let USER_VIDEO = "thnku";


function getValKey() {
    return "grp" + USER_VIDEO;
}

let VAL_KEY = getValKey();
let grp_vals = {};

let delay_per_unit = 30;
let bg_color = "lightgrey";
let cell_color = 'grey';

// Dimensions of single chart.
let margin = { top: 0, right: 0, bottom: 0, left: 6 };
let width = 134 - margin.left - margin.right;
let height = 134 - margin.top - margin.bottom;




d3.csv("data/square_pie.csv", function (error, data) {
    if (error) throw error;
    console.log(data)
    let valfields = d3.keys(field_details);
    // Make data accessible by grp key
    data.forEach(function (o) {
        grp_vals["grp" + o.video] = o;
    });

    //
    // Setup grid.
    //
    let cells = [];
    d3.select("#grid").text().split("\n").forEach(function (line, i) {
        let re = /\w+/g, m;
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
    valfields.forEach(function (v, i) {
        let grid_width = d3.max(cells, d => d.x) + 2;
        let grid_height = d3.max(cells, d => d.y) + 2;
        let cell_size = width / grid_width;
        let holder_width = width + margin.left + margin.right;


        let chart_perc = grp_vals[VAL_KEY][v];


        // create chartholder
        let div = d3.select("#charts").append("div")
            .attr("id", "holder" + v)
            .attr("class", "chartholder")
            .style("width", holder_width + "px");

        // add h3 for each chart
        div.append("h3")
            .attr('class', 'h3title')
            .append('text')
            .text(`${field_details[v].desc}: ${chart_perc}%`);

        // add svg
        let svg = div.append("svg")
            .attr("class", "squarepie")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let cell = svg.append("g")
            .attr("id", "vf" + v)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
            .selectAll(".cell")
            .data(cells)
            .enter().append("g")
            .attr("class", "cell")
            .attr("transform", d => "translate(" + (d.x - grid_width / 2) * cell_size + "," + (d.y - grid_height / 2) * cell_size + ")");

        cell.append("rect")
            .attr("x", -cell_size / 2)
            .attr("y", -cell_size / 2)
            .attr('width', cell_size)
            .attr('height', cell_size)
            .attr('rx', 3)
            .attr('stroke', 'black')
            .attr('stroke-width', .5)
            .attr("fill", (d, i) => (i < (100 - grp_vals[VAL_KEY][v])) ? bg_color : cell_color)


    }); // @end forEach()


    d3.select("#charts").append("div").attr("class", "clr");



    //
    // Group selection with buttons
    //
    d3.selectAll("#percentages .button").on("click", function () {
        USER_VIDEO = d3.select(this).attr("data-val");
        d3.select("#percentages .current").classed("current", false);
        d3.select(this).classed("current", true);
        update();
    });


    // 
    // Update based on current group
    //
    function update() {

        let prev_val_key = VAL_KEY;
        VAL_KEY = getValKey();

        // Update charts.
        valfields.forEach(function (v, k) {

            let start_i = 100 - grp_vals[prev_val_key][v];
            let end_i = 100 - grp_vals[VAL_KEY][v];
            let new_perc = grp_vals[VAL_KEY][v];

            // update title
            d3.select(`#holder${v}`)
                .select("h3")
                .transition()
                // .delay(800)
                .text(`${field_details[v].desc}: ${new_perc}%`);

            d3.select("#vf" + v).selectAll(".cell rect")
                .transition()
                .duration(750)
                .delay(function (d, i) {

                    // Decreasing
                    if (start_i < end_i) {
                        let curr_delay = (i - start_i) * delay_per_unit;
                        curr_delay = Math.max(curr_delay, 0);
                        return curr_delay;
                    }

                    // Increasing
                    else if (start_i > end_i) {
                        let curr_delay = (start_i - i) * delay_per_unit;
                        curr_delay = Math.max(curr_delay, 0);
                        return curr_delay;
                    }

                    // No change.
                    else {
                        return 0;
                    }
                })
                .attr("fill", (d, i) => (i < (100 - grp_vals[VAL_KEY][v])) ? bg_color : cell_color)


        }); // @end forEach()

    } // @end update()




}); // @end d3.tsv()
