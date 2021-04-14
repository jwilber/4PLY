  var salesData;
    var truncLengh = 30;
    $(document).ready(function () {
        Plot();
    });
    function Plot() {
        TransformChartData(chartData, chartOptions);
        BuildBar("chart", chartData, chartOptions);
    }

    function BuildBar(id, chartData, options, level) {
        //d3.selectAll("#" + id + " .innerCont").remove();
        //$("#" + id).append(chartInnerDiv);
        chart = d3.select("#" + id + " .innerCont");

        var margin = { top: 50, right: 10, bottom: 30, left: 50 },
        width = $(chart[0]).outerWidth() - margin.left - margin.right,
        height = $(chart[0]).outerHeight() - margin.top - margin.bottom
        var xVarName;
        var yVarName = options[0].yaxis;

        if (level == 1) {
            xVarName = options[0].xaxisl1;
        }
        else {
            xVarName = options[0].xaxis;
        }

        var xAry = runningData.map(function (el) {
            return el[xVarName];
        });

        var yAry = runningData.map(function (el) {
            return el[yVarName];
        });

        var capAry = runningData.map(function (el) { return el.caption; });


        var x = d3.scale.ordinal()
            .domain(xAry)
            .rangeRoundBands([0, width], .5);
        var y = d3.scale.linear().domain([0, d3.max(runningData, function (d) { return d[yVarName]; })]).range([height, 0]);
        var rcolor = d3.scale.ordinal().range(runningColors);

        chart = chart
                    .append("svg")  //append svg element inside #chart
                    .attr("width", width + margin.left + margin.right)    //set width
                    .attr("height", height + margin.top + margin.bottom);  //set height

        var bar = chart.selectAll("g")
                        .data(runningData)
                        .enter()
                        .append("g")
                        //.attr("filter", "url(#dropshadow)")
                        .attr("transform", function (d) {
                            return "translate(" + x(d[xVarName]) + ", 0)";
                        });

        var ctrtxt = 0;
        var xAxis = d3.svg.axis()
                    .scale(x)
                    //.orient("bottom").ticks(xAry.length).tickValues(capAry);  //orient bottom because x-axis tick labels will appear on the
                    .orient("bottom").ticks(xAry.length)
                    .tickFormat(function (d) {
                        if (level == 0) {
                            var mapper = options[0].captions[0]
                            return mapper[d]
                        }
                        else {
                            var r = runningData[ctrtxt].caption;
                            ctrtxt += 1;
                            return r;
                        }
                    });

        var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left").ticks(5); //orient left because y-axis tick labels will appear on the left side of the axis.

        bar.append("rect")
            .attr("y", function (d) {
                        return y(d[yVarName]) + margin.top - 15;
                    })
            .attr("x", function (d) {
                return (margin.left);
            })
            .on("mouseenter", function (d) {
                d3.select(this)
                    .attr("stroke", "white")
                    .attr("stroke-width", 1)
                    .attr("height", function (d) {
                        return height - y(d[yVarName]) + 5;
                    })
                    .attr("y", function (d) {
                        return y(d[yVarName]) + margin.top - 15;
                    })
                    .attr("width", x.rangeBand() + 10)
                    .attr("x", function (d) {
                        return (margin.left - 5);
                    })
                    .transition()
                    .duration(200);


            })
            .on("mouseleave", function (d) {
                d3.select(this)
                    .attr("stroke", "none")
                    .attr("height", function (d) {
                        return height - y(d[yVarName]);;
                    })
                    .attr("y", function (d) {
                        return y(d[yVarName]) + margin.top - 15;
                    })
                    .attr("width", x.rangeBand())
                    .attr("x", function (d) {
                        return (margin.left);
                    })
                    .transition()
                    .duration(200);

            })
            .on("click", function (d) {
                if (this._listenToEvents) {
                    // Reset inmediatelly
                    d3.select(this).attr("transform", "translate(0,0)")
                    // Change level on click if no transition has started                
                    path.each(function () {
                        this._listenToEvents = false;
                    });
                }
                d3.selectAll("#" + id + " svg").remove();
                if (level == 1) {
                    TransformChartData(chartData, options, 0, d[xVarName]);
                    BuildBar(id, chartData, options, 0);
                }
                else {
                    var nonSortedChart = chartData.sort(function (a, b) {
                        return parseFloat(b[options[0].yaxis]) - parseFloat(a[options[0].yaxis]);
                    });
                    TransformChartData(nonSortedChart, options, 1, d[xVarName]);
                    BuildBar(id, nonSortedChart, options, 1);
                }

            });


        bar.selectAll("rect").attr("height", function (d) {
            return height - y(d[yVarName]);
        })
            .transition().delay(function (d, i) { return i * 300; })
            .duration(1000)
            .attr("width", x.rangeBand()) //set width base on range on ordinal data
            .transition().delay(function (d, i) { return i * 300; })
            .duration(1000);

        bar.selectAll("rect").style("fill", function (d) {
            return rcolor(d[xVarName]);
        })
        .style("opacity", function (d) {
            return d["op"];
        });

        bar.append("text")
            .attr("x", x.rangeBand() / 2 + margin.left - 10)
            .attr("y", function (d) { return y(d[yVarName]) + margin.top - 25; })
            .attr("dy", ".35em")
            .text(function (d) {
                return d[yVarName];
            });

        bar.append("svg:title")
            .text(function (d) {
                //return xVarName + ":  " + d["title"] + " \x0A" + yVarName + ":  " + d[yVarName];
                return d["title"] + " (" + d[yVarName] + ")";
            });

        chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + margin.left + "," + (height + margin.top - 15) + ")")
            .call(xAxis)
        .append("text")
            .attr("x", width)
            .attr("y", -6)
        .style("text-anchor", "end")
        //.text("Year");

        chart.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin.left + "," + (margin.top - 15) + ")")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
        //.text("Sales Data");

        if (level == 1) {
            chart.select(".x.axis")
            .selectAll("text")
            // .attr("transform", " translate(-20,10) rotate(-35)");
        }

    }

    function TransformChartData(chartData, opts, level, filter) {
        var result = [];
        var resultColors = [];
        var counter = 0;
        var hasMatch;
        var xVarName;
        var yVarName = opts[0].yaxis;

        if (level == 1) {
            xVarName = opts[0].xaxisl1;

            for (var i in chartData) {
                hasMatch = false;
                for (var index = 0; index < result.length; ++index) {
                    var data = result[index];

                    if ((data[xVarName] == chartData[i][xVarName]) && (chartData[i][opts[0].xaxis]) == filter) {
                        result[index][yVarName] = result[index][yVarName] + chartData[i][yVarName];
                        hasMatch = true;
                        break;
                    }

                }
                if ((hasMatch == false) && ((chartData[i][opts[0].xaxis]) == filter)) {
                    if (result.length < 9) {
                        ditem = {}
                        ditem[xVarName] = chartData[i][xVarName];
                        ditem[yVarName] = chartData[i][yVarName];
                        ditem["caption"] = chartData[i][xVarName].substring(0, 30);
                        ditem["title"] = chartData[i][xVarName];
                        // this rotates
                        ditem["op"] = 1.0 - parseFloat("0." + (result.length));
                        result.push(ditem);

                        resultColors[counter] = opts[0].color[0][chartData[i][opts[0].xaxis]];

                        counter += 1;
                    }
                }
            }
        }
        else {
            xVarName = opts[0].xaxis;

            for (var i in chartData) {
                hasMatch = false;
                for (var index = 0; index < result.length; ++index) {
                    var data = result[index];

                    if (data[xVarName] == chartData[i][xVarName]) {
                        result[index][yVarName] = result[index][yVarName] + chartData[i][yVarName];
                        hasMatch = true;
                        break;
                    }
                }
                if (hasMatch == false) {
                    ditem = {};
                    ditem[xVarName] = chartData[i][xVarName];
                    ditem[yVarName] = chartData[i][yVarName];
                    ditem["caption"] = opts[0].captions != undefined ? opts[0].captions[0][chartData[i][xVarName]] : "";
                    ditem["title"] = opts[0].captions != undefined ? opts[0].captions[0][chartData[i][xVarName]] : "";
                    ditem["op"] = 1;
                    result.push(ditem);

                    resultColors[counter] = opts[0].color != undefined ? opts[0].color[0][chartData[i][xVarName]] : "";

                    counter += 1;
                }
            }
        }


        runningData = result;
        runningColors = resultColors;
        return;
    }


    var chartData = 

    [
 // {
 //   "trick": "Regular",
 //   "obstacle": "Total",
 //   "cnt": 639
 // },

 // {"trick": "Switch",
 //   "obstacle": "Total",
 //   "cnt": 174
 // },
 {
   "trick": "wallie",
   "obstacle": "wall",
   "cnt": 8
 },
 {
   "trick": "unique",
   "obstacle": "wall",
   "cnt": 5
 },
 {
   "trick": "bs tailslide",
   "obstacle": "transition",
   "cnt": 3
 },
 {
   "trick": "fs ollie",
   "obstacle": "transition",
   "cnt": 2
 },
 {
   "trick": "fs 5-0",
   "obstacle": "transition",
   "cnt": 2
 },
 {
   "trick": "fs lipslide",
   "obstacle": "transition",
   "cnt": 2
 },
 {
   "trick": "unique",
   "obstacle": "transition",
   "cnt": 25
 },
 {
   "trick": "fs kickflip",
   "obstacle": "stairs",
   "cnt": 7
 },
 {
   "trick": "kickflip",
   "obstacle": "stairs",
   "cnt": 7
 },
 {
   "trick": "sw heelflip",
   "obstacle": "stairs",
   "cnt": 7
 },
 {
   "trick": "bs bigspin",
   "obstacle": "stairs",
   "cnt": 6
 },
 {
   "trick": "ollie",
   "obstacle": "stairs",
   "cnt": 6
 },
 {
   "trick": "hardflip",
   "obstacle": "stairs",
   "cnt": 5
 },
 {
   "trick": "sw fs kickflip",
   "obstacle": "stairs",
   "cnt": 5
 },
 {
   "trick": "heelflip",
   "obstacle": "stairs",
   "cnt": 4
 },
 {
   "trick": "nollie bs kickflip",
   "obstacle": "stairs",
   "cnt": 4
 },
 {
   "trick": "nollie kickflip",
   "obstacle": "stairs",
   "cnt": 4
 },
 {
   "trick": "fakie fs kickflip",
   "obstacle": "stairs",
   "cnt": 3
 },
 {
   "trick": "halfcab kickflip",
   "obstacle": "stairs",
   "cnt": 3
 },
 {
   "trick": "tre flip",
   "obstacle": "stairs",
   "cnt": 3
 },
 {
   "trick": "varial heelflip",
   "obstacle": "stairs",
   "cnt": 3
 },
 {
   "trick": "bs boardslide",
   "obstacle": "stairs",
   "cnt": 2
 },
 {
   "trick": "bs heelflip",
   "obstacle": "stairs",
   "cnt": 2
 },
 {
   "trick": "bs kickflip",
   "obstacle": "stairs",
   "cnt": 2
 },
 {
   "trick": "fakie fullcab",
   "obstacle": "stairs",
   "cnt": 2
 },
 {
   "trick": "fakie kickflip",
   "obstacle": "stairs",
   "cnt": 2
 },
 {
   "trick": "fs 360",
   "obstacle": "stairs",
   "cnt": 2
 },
 {
   "trick": "fs bigspin",
   "obstacle": "stairs",
   "cnt": 2
 },
 {
   "trick": "fs shuv",
   "obstacle": "stairs",
   "cnt": 2
 },
 {
   "trick": "nollie bs heelflip",
   "obstacle": "stairs",
   "cnt": 2
 },
 {
   "trick": "nollie fs heelflip",
   "obstacle": "stairs",
   "cnt": 2
 },
 {
   "trick": "nollie fs kickflip",
   "obstacle": "stairs",
   "cnt": 2
 },
 {
   "trick": "sw fs heelflip",
   "obstacle": "stairs",
   "cnt": 2
 },
 {
   "trick": "sw kickflip",
   "obstacle": "stairs",
   "cnt": 2
 },
 {
   "trick": "unique",
   "obstacle": "stairs",
   "cnt": 20
 },
 {
   "trick": "bs 5050",
   "obstacle": "rail",
   "cnt": 16
 },
 {
   "trick": "bs crook",
   "obstacle": "rail",
   "cnt": 12
 },
 {
   "trick": "bs lipslide",
   "obstacle": "rail",
   "cnt": 12
 },
 {
   "trick": "fs 5050",
   "obstacle": "rail",
   "cnt": 12
 },
 {
   "trick": "fs feeble",
   "obstacle": "rail",
   "cnt": 10
 },
 {
   "trick": "fs smith",
   "obstacle": "rail",
   "cnt": 10
 },
 {
   "trick": "bs overcrook",
   "obstacle": "rail",
   "cnt": 9
 },
 {
   "trick": "bs boardslide",
   "obstacle": "rail",
   "cnt": 8
 },
 {
   "trick": "fs 5-0",
   "obstacle": "rail",
   "cnt": 8
 },
 {
   "trick": "bs smith",
   "obstacle": "rail",
   "cnt": 7
 },
 {
   "trick": "nollie to bs crook",
   "obstacle": "rail",
   "cnt": 5
 },
 {
   "trick": "bs feeble",
   "obstacle": "rail",
   "cnt": 4
 },
 {
   "trick": "fs 180 to sw bs crook",
   "obstacle": "rail",
   "cnt": 4
 },
 {
   "trick": "fs blunt",
   "obstacle": "rail",
   "cnt": 4
 },
 {
   "trick": "fs boardslide",
   "obstacle": "rail",
   "cnt": 4
 },
 {
   "trick": "kickflip to fs boardslide",
   "obstacle": "rail",
   "cnt": 4
 },
 {
   "trick": "nollie to fs feeble",
   "obstacle": "rail",
   "cnt": 4
 },
 {
   "trick": "bs noseblunt",
   "obstacle": "rail",
   "cnt": 3
 },
 {
   "trick": "fs lipslide",
   "obstacle": "rail",
   "cnt": 3
 },
 {
   "trick": "halfcab to bs crook",
   "obstacle": "rail",
   "cnt": 3
 },
 {
   "trick": "kickflip to bs boardslide",
   "obstacle": "rail",
   "cnt": 3
 },
 {
   "trick": "kickflip to bs lipslide",
   "obstacle": "rail",
   "cnt": 3
 },
 {
   "trick": "kickflip to bs smith",
   "obstacle": "rail",
   "cnt": 3
 },
 {
   "trick": "kickflip to fs 5050",
   "obstacle": "rail",
   "cnt": 3
 },
 {
   "trick": "kickflip to fs crook",
   "obstacle": "rail",
   "cnt": 3
 },
 {
   "trick": "tre flip to 5050",
   "obstacle": "rail",
   "cnt": 3
 },
 {
   "trick": "bs 180 to sw bs 5-0",
   "obstacle": "rail",
   "cnt": 2
 },
 {
   "trick": "bs blunt",
   "obstacle": "rail",
   "cnt": 2
 },
 {
   "trick": "fs 270 to bs lip to regular",
   "obstacle": "rail",
   "cnt": 2
 },
 {
   "trick": "fs boardslide to fakie",
   "obstacle": "rail",
   "cnt": 2
 },
 {
   "trick": "fs noseblunt",
   "obstacle": "rail",
   "cnt": 2
 },
 {
   "trick": "fs nosegrind",
   "obstacle": "rail",
   "cnt": 2
 },
 {
   "trick": "fs shuv to bs crook",
   "obstacle": "rail",
   "cnt": 2
 },
 {
   "trick": "fs tailslide",
   "obstacle": "rail",
   "cnt": 2
 },
 {
   "trick": "kickflip to bs 5050",
   "obstacle": "rail",
   "cnt": 2
 },
 {
   "trick": "nollie fs 180 to sw bs crook",
   "obstacle": "rail",
   "cnt": 2
 },
 {
   "trick": "nollie to bs 5-0",
   "obstacle": "rail",
   "cnt": 2
 },
 {
   "trick": "nollie to fs nosegrind",
   "obstacle": "rail",
   "cnt": 2
 },
 {
   "trick": "shuv to fs 5050",
   "obstacle": "rail",
   "cnt": 2
 },
 {
   "trick": "suicide 5050",
   "obstacle": "rail",
   "cnt": 2
 },
 {
   "trick": "sw fs bigspin to bs boardslide",
   "obstacle": "rail",
   "cnt": 2
 },
 {
   "trick": "sw kickflip to sw fs boardslide",
   "obstacle": "rail",
   "cnt": 2
 },
 {
   "trick": "unique",
   "obstacle": "rail",
   "cnt": 57
 },
 {
   "trick": "bs lipslide",
   "obstacle": "ledge",
   "cnt": 6
 },
 {
   "trick": "fs noseblunt",
   "obstacle": "ledge",
   "cnt": 6
 },
 {
   "trick": "fs tailslide to fakie",
   "obstacle": "ledge",
   "cnt": 6
 },
 {
   "trick": "fs tailslide",
   "obstacle": "ledge",
   "cnt": 5
 },
 {
   "trick": "bs 5050",
   "obstacle": "ledge",
   "cnt": 3
 },
 {
   "trick": "bs tailslide to bs kickflip",
   "obstacle": "ledge",
   "cnt": 3
 },
 {
   "trick": "fs blunt",
   "obstacle": "ledge",
   "cnt": 3
 },
 {
   "trick": "kickflip to bs crook",
   "obstacle": "ledge",
   "cnt": 3
 },
 {
   "trick": "sw bs crook",
   "obstacle": "ledge",
   "cnt": 3
 },
 {
   "trick": "sw kickflip to sw bs crook",
   "obstacle": "ledge",
   "cnt": 3
 },
 {
   "trick": "bs noseblunt to fakie",
   "obstacle": "ledge",
   "cnt": 2
 },
 {
   "trick": "bs tailslide",
   "obstacle": "ledge",
   "cnt": 2
 },
 {
   "trick": "fs 180 to sw bs crook",
   "obstacle": "ledge",
   "cnt": 2
 },
 {
   "trick": "fs 180 to sw fs 5-0 to regular",
   "obstacle": "ledge",
   "cnt": 2
 },
 {
   "trick": "fs boardslide",
   "obstacle": "ledge",
   "cnt": 2
 },
 {
   "trick": "fs noseslide",
   "obstacle": "ledge",
   "cnt": 2
 },
 {
   "trick": "halfcab to bs crook",
   "obstacle": "ledge",
   "cnt": 2
 },
 {
   "trick": "kickflip to bs lipslide",
   "obstacle": "ledge",
   "cnt": 2
 },
 {
   "trick": "kickflip to bs tailslide",
   "obstacle": "ledge",
   "cnt": 2
 },
 {
   "trick": "kickflip to fs 5050",
   "obstacle": "ledge",
   "cnt": 2
 },
 {
   "trick": "kickflip to fs noseslide",
   "obstacle": "ledge",
   "cnt": 2
 },
 {
   "trick": "nollie bs 180 to sw fs crook",
   "obstacle": "ledge",
   "cnt": 2
 },
 {
   "trick": "nollie fs 180 to sw bs crook",
   "obstacle": "ledge",
   "cnt": 2
 },
 {
   "trick": "nollie to bs crook",
   "obstacle": "ledge",
   "cnt": 2
 },
 {
   "trick": "slappy bs crook",
   "obstacle": "ledge",
   "cnt": 2
 },
 {
   "trick": "sw bs crook to regular",
   "obstacle": "ledge",
   "cnt": 2
 },
 {
   "trick": "sw bs tailslide to regular",
   "obstacle": "ledge",
   "cnt": 2
 },
 {
   "trick": "sw heelflip to sw fs nosegrind",
   "obstacle": "ledge",
   "cnt": 2
 },
 {
   "trick": "unique",
   "obstacle": "ledge",
   "cnt": 86
 },
 {
   "trick": "ollie",
   "obstacle": "gap",
   "cnt": 22
 },
 {
   "trick": "kickflip",
   "obstacle": "gap",
   "cnt": 13
 },
 {
   "trick": "fs kickflip",
   "obstacle": "gap",
   "cnt": 9
 },
 {
   "trick": "bs kickflip",
   "obstacle": "gap",
   "cnt": 7
 },
 {
   "trick": "bs 180",
   "obstacle": "gap",
   "cnt": 5
 },
 {
   "trick": "fs 180",
   "obstacle": "gap",
   "cnt": 5
 },
 {
   "trick": "fs heelflip",
   "obstacle": "gap",
   "cnt": 5
 },
 {
   "trick": "hardflip",
   "obstacle": "gap",
   "cnt": 5
 },
 {
   "trick": "tre flip",
   "obstacle": "gap",
   "cnt": 5
 },
 {
   "trick": "fs shuv",
   "obstacle": "gap",
   "cnt": 4
 },
 {
   "trick": "sw fs bigspin",
   "obstacle": "gap",
   "cnt": 3
 },
 {
   "trick": "sw heelflip",
   "obstacle": "gap",
   "cnt": 3
 },
 {
   "trick": "sw kickflip",
   "obstacle": "gap",
   "cnt": 3
 },
 {
   "trick": "varial heelflip",
   "obstacle": "gap",
   "cnt": 3
 },
 {
   "trick": "bs 360 kickflip",
   "obstacle": "gap",
   "cnt": 2
 },
 {
   "trick": "late shuv",
   "obstacle": "gap",
   "cnt": 2
 },
 {
   "trick": "nollie bs kickflip",
   "obstacle": "gap",
   "cnt": 2
 },
 {
   "trick": "nollie fs kickflip",
   "obstacle": "gap",
   "cnt": 2
 },
 {
   "trick": "nollie inward heel",
   "obstacle": "gap",
   "cnt": 2
 },
 {
   "trick": "unique",
   "obstacle": "gap",
   "cnt": 16
 },
 {
   "trick": "kickflip",
   "obstacle": "flat",
   "cnt": 9
 },
 {
   "trick": "tre flip",
   "obstacle": "flat",
   "cnt": 8
 },
 {
   "trick": "sw tre flip",
   "obstacle": "flat",
   "cnt": 6
 },
 {
   "trick": "fakie kickflip",
   "obstacle": "flat",
   "cnt": 5
 },
 {
   "trick": "bs bigspin",
   "obstacle": "flat",
   "cnt": 4
 },
 {
   "trick": "fs kickflip",
   "obstacle": "flat",
   "cnt": 4
 },
 {
   "trick": "nollie kickflip",
   "obstacle": "flat",
   "cnt": 4
 },
 {
   "trick": "bs 180",
   "obstacle": "flat",
   "cnt": 3
 },
 {
   "trick": "bs kickflip",
   "obstacle": "flat",
   "cnt": 3
 },
 {
   "trick": "fs shuv",
   "obstacle": "flat",
   "cnt": 3
 },
 {
   "trick": "halfcab kickflip",
   "obstacle": "flat",
   "cnt": 3
 },
 {
   "trick": "heelflip",
   "obstacle": "flat",
   "cnt": 3
 },
 {
   "trick": "nollie heelflip",
   "obstacle": "flat",
   "cnt": 3
 },
 {
   "trick": "sw fs heelflip",
   "obstacle": "flat",
   "cnt": 3
 },
 {
   "trick": "sw heelflip",
   "obstacle": "flat",
   "cnt": 3
 },
 {
   "trick": "bs 360",
   "obstacle": "flat",
   "cnt": 2
 },
 {
   "trick": "fakie fs 180",
   "obstacle": "flat",
   "cnt": 2
 },
 {
   "trick": "fakie tre flip",
   "obstacle": "flat",
   "cnt": 2
 },
 {
   "trick": "fs 180",
   "obstacle": "flat",
   "cnt": 2
 },
 {
   "trick": "halfcab",
   "obstacle": "flat",
   "cnt": 2
 },
 {
   "trick": "sw big heel",
   "obstacle": "flat",
   "cnt": 2
 },
 {
   "trick": "sw kickflip",
   "obstacle": "flat",
   "cnt": 2
 },
 {
   "trick": "unique",
   "obstacle": "flat",
   "cnt": 12
 }
]

    ;
    chartOptions = [{
        "captions": [{ "Total": "Total", "wall": "Wall", "transition": "Transition", "stairs": "Stairs", "rail": "Rail", "ledge": "Ledge", "gap": "Gap", "flat": "Flat" }],
        "color": [{ "wall": "darkgrey", "transition": "darkgrey", "stairs": "darkgrey" , "rail": "darkgrey" , "ledge": "darkgrey" , "gap": "darkgrey", "flat": "darkgrey"}],
        "xaxis": "obstacle",
        "xaxisl1": "trick",
        "yaxis": "cnt"
    }]