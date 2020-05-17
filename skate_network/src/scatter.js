class Scatter {

    constructor(opts) {
        // load in arguments from config object
        this.data = opts.data;
        this.element = opts.element;
        this.title = opts.title;
        // create the chart
        const that = this
        d3.csv(this.data, (data) => {
            that.dataset = data;
            console.log(data)
            that.draw(data);
        })
    }

    draw(data) {
        // chart constants
        // define width, height and margin
        this.margin = { top: 75, right: 100, bottom: 50, left: 40 };
        this.width = window.innerWidth / 2 - this.margin.left - this.margin.right,
            this.height = window.innerHeight / 1.25 - this.margin.top - this.margin.bottom;
        // set up parent element and SVG
        this.svg = d3.select(this.element).append('svg');
        this.svg.attr('width', this.width + this.margin.left + this.margin.right);
        this.svg.attr('height', this.height + this.margin.top + this.margin.bottom);
        // this.svg.style('background-color', 'pink');
        this.plot = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        // create the other stuff
        this.createScales(data);
        this.addAxes(data);
        this.addDots(data);
        this.addChartLabels();
        // this.addInteractivity()

        this.svg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("refX", 100) // x-position
            .attr("refY", 10) // y-position offset from axis
            .attr("markerWidth", 13)
            .attr("markerHeight", 19)
            .attr("orient", "right")
            .append("path")
            .attr("d", "M2,2 L2,13 L8,7 L2, 2");
    }

    createScales(data) {
        // Create scales for chart
        this.x = d3.scaleLinear()
            .domain(d3.extent(data, d => +d.comp1))
            .range([0, this.width]);

        this.y = d3.scaleLinear()
            .domain(d3.extent(data, d => +d.comp2))
            .range([this.height, 0]);
    }

    addAxes(data) {
        // only want axes to go halfway
        let xMax = d3.max(data, d => +d.comp1);
        console.log(xMax)
        // console.log(xDomain[0] / 2)
        let xHalf = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d.comp1) / 2])
            .range([0, this.width / 1.2]);

        this.xAxis = this.plot.append("g")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(xHalf))

        // add arrow to x-axis
        this.xAxis.select("path").attr("marker-end", "url(#arrowhead)");

        // only add half y-axis
        let yHalf = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d.comp2) / 2])
            .range([0, this.height / 1.2]);
        this.yAxis = this.plot.append("g")
            .attr("transform", "translate(0," + (this.height - (this.height / 1.2)) + ")")
            .call(d3.axisLeft(yHalf))
            .style('font-family', 'Bungee');
    }

    addDots(data) {
        const that = this;
        let dots = this.plot
            .selectAll('g.dot')
            .data(data)
            .enter()
            .append('g')
            .classed('dot', true)

        // add circles
        dots.append('circle')
            .attr('r', 6)
            .attr('cx', d => that.x(d.comp1))
            .attr('cy', d => that.y(d.comp2))
            .attr('fill', 'pink')
            .attr('stroke', 'teal')
            .style('opacity', 0.45)

        // Add Labels
        dots.append('text')
            .text(d => d.filmer)
            .attr('x', d => that.x(d.comp1) - 28)
            .attr('y', function (d) {
                if (d.filmer == "Jamie Thomas") {
                    return that.y(d.comp2) + 8;
                } else if (d.filmer == "Mike Manzoori") {
                    return that.y(d.comp2) + 10;
                } else if (d.filmer == "Russell Houghten") {
                    return that.y(d.comp2) + 5;
                } else if (d.filmer == "Jason Hernandez") {
                    return that.y(d.comp2) + 3;
                } else if (d.filmer == "Dan Wolfe") {
                    return that.y(d.comp2) + 5;
                } else {
                    return that.y(d.comp2) - 5
                }
            })
            .style("font-size", "9px")
            .style('font-family', 'Bungee')
            .style('opacity', function (d) {
                if (d.filmer == "Matt Solomon") {
                    return 0
                } else if (d.comp2 > 1. | d.comp1 > 1 ? 1 : 0) {
                    return 1
                } else {
                    return 0
                }
            })
            .style('pointer-events', 'none')
            .raise()


        dots.selectAll('circle')
            .on('mouseover', function (d) {
                console.log(d)
                // dampen all other elements
                // if (d.comp2 > 1. | d.comp1 > 1) {
                //     d3.selectAll('g.dot').style('opacity', 0.25)
                // }

                //highlight current element
                d3.select(this).attr('stroke-width', 3)
                d3.select(this.parentNode).select('text')
                    .style('opacity', 1)
                    .style('font-size', '9px')
                    .style('font-weight', 'bold')
            })
            .on('mouseout', function (d) {
                // reset all circles opacity
                d3.selectAll('g.dot').style('opacity', 1)
                d3.select(this).attr('stroke-width', 1)
                d3.select(this.parentNode).select('text')
                    .style('opacity', d => d.comp2 > 1. | d.comp1 > 1 ? 1 : 0)
                    .style('font-size', '9px')
                    .style('font-weight', 'normal')
            })

    }

    addChartLabels() {
        // add title
        d3.select(this.element).select('svg').append("text")
            .attr('class', 'ts-title')
            .attr("x", this.margin.left)
            .attr("y", this.margin.top / 1.5)
            .attr("text-anchor", "left")
            .style("font-size", "20px")
            .style("text-decoration", "underline")
            .text('Similar Filmers');

        // add x-label
        d3.select(this.element).select('svg').append('text')
            .attr("x", this.width / 4)
            .attr("y", this.height + this.margin.bottom + this.margin.top / 1.5)
            .style("font-size", "20px")
            .style("text-decoration", "underline")
            .text('Component 1');

        // add y-label
        d3.select(this.element).select('svg').append('text')
            .attr("x", this.margin.left / 4)
            .attr("y", (this.height + this.margin.bottom + this.margin.top) / 1.3)
            .attr("dy", ".35em")
            .attr('transform', 'rotate(90)')
            .style("font-size", "20px")
            .style("text-decoration", "underline")
            .text('Component 2');
    }

}