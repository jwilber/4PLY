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
        this.margin = { top: 75, right: 45, bottom: 50, left: 30 };
        this.widthBase = window.innerWidth >= 900 ?
            window.innerWidth / 1.9 :
            window.innerWidth / 1.25;
        this.width = this.widthBase - this.margin.left - this.margin.right,
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

        // axis arrows
        let defs = this.svg.append('defs')

        defs.append('marker')
            .attr('id', 'arrowhead-right')
            .attr('refX', 5)
            .attr('refY', 5)
            .attr('markerWidth', 16)
            .attr('markerHeight', 13)
            .append('path')
            .attr('d', 'M 0 0 L 5 5 L 0 10')
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('fill', 'none')

        defs.append('marker')
            .attr('id', 'arrowhead-up')
            .attr('refX', 5)
            .attr('refY', 5)
            .attr('markerWidth', 16)
            .attr('markerHeight', 13)
            .attr('orient', 270)
            .append('path')
            .attr('d', 'M 0 0 L 5 5 L 0 10')
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('fill', 'none')


        // annotations
        this.annotations = [
            {
                //below in makeAnnotations has type set to d3.annotationLabel
                //you can add this type value below to override that default
                type: d3.annotationCalloutCircle,
                note: {
                    // label: "Here's the text for 'label'",
                    title: "Heavy Crailtap Influence",
                    wrap: 190 // how long label can be
                },
                //settings for the subject, in this case the circle radius
                subject: {
                    radius: 90
                },
                x: (this.width / 1.08), //
                y: (this.height / 1.1), //
                dy: -110, // y-pos for text
                dx: -80 // x-pos for text
            },
            {
                type: d3.annotationCalloutCircle,
                note: {
                    // label: "yep, that's smaller circle",
                    title: "ZERO",
                    wrap: 90
                },
                connector: {
                },
                subject: {
                    radius: 20
                },
                x: 40,
                y: 75,
                dy: 30,
                dx: 30
            }].map(function (d) { d.color = "black"; return d })

        let makeAnnotations = d3.annotation()
            .type(d3.annotationLabel)
            .annotations(this.annotations)

        this.svg.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations)

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
            .domain([0, d3.max(data, d => +d.comp1) / 1])
            .range([0, this.width / 1]);

        this.xAxis = this.plot.append("g")
            .attr('class', 'x-axis')
            .attr("transform", `translate(-10, ${this.height + 5})`)
            .call(d3.axisBottom(xHalf).tickSize(0))

        // add arrow to x-axis
        this.xAxis.select("path").attr("marker-end", "url(#arrowhead-right)");

        // only add half y-axis
        let yHalf = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d.comp2) / 1])
            .range([0, this.height / 1.05]);
        this.yAxis = this.plot.append("g")
            .attr("transform", "translate(-10," + (5 + this.height - (this.height / 1.05)) + ")")
            .call(d3.axisLeft(yHalf).tickSize(0))
            .style('font-family', 'Bungee');

        // add arrow to y-axis
        this.yAxis.select("path").attr("marker-start", "url(#arrowhead-up)")
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
        // .text('Similar Filmers');

        // add x-label
        d3.select(this.element).select('svg').append('text')
            .attr("x", this.width / 2)
            .attr("y", this.height + this.margin.bottom + this.margin.top / 1.5)
            .style("font-size", "0.9rem")
            .text('PC 1');

        // add y-label
        d3.select(this.element).select('svg').append('text')
            .attr("x", -((this.height / 1.4)))
            .attr("y", this.margin.left / 2)
            .attr("dy", ".05em")
            .attr('transform', 'rotate(-90)')
            .style("font-size", "0.9rem")
            .text('PC 2');
    }

}