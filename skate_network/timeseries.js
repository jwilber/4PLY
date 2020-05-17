class TimeSeries {

    constructor(opts) {
        // load in arguments from config object
        this.data = opts.data;
        this.element = opts.element;
        this.title = opts.title;
        this.metric = opts.metric
        // create the chart
        const that = this
        d3.csv(this.data, (data) => {
            that.dataset = data;
            console.log(data.map(d => d['ABE2']))
            that.draw(data);
        })
    }

    draw(data) {
        // define width, height and margin
        this.margin = { top: 75, right: 50, bottom: 30, left: 40 };
        this.width = 460 - this.margin.left - this.margin.right,
            this.height = 300 - this.margin.top - this.margin.bottom;
        this.bisect = d3.bisector(d => d.time).left
        // set up parent element and SVG
        this.svg = d3.select(this.element).append('svg');
        this.svg.attr('width', this.width + this.margin.left + this.margin.right);
        this.svg.attr('height', this.height + this.margin.top + this.margin.bottom);
        // we'll actually be appending to a <g> element
        this.plot = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        // create the other stuff
        this.createScales(data);
        this.addAxes();
        this.addLine(data);
        this.addTitle();
        this.addInteractivity()
    }

    createScales(data) {
        let yMax = this.metric == 'hc' ? 1500 : 100

        this.y = d3.scaleLinear()
            .domain([0, yMax])
            .range([this.height, 0]);

        this.x = d3.scaleTime()
            .domain(d3.extent(data, d => new Date(d.date)))
            .range([0, this.width]);
    }

    addAxes() {
        this.plot.append("g")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(this.x).tickFormat(d3.timeFormat("%m/%d")))
            .style('font-family', 'Share Tech Mono')
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-30)");

        this.yAxis = this.plot.append("g")
            .call(d3.axisLeft(this.y))
            .style('font-family', 'Share Tech Mono');
    }

    addLine(data) {
        const that = this
        this.line = this.plot
            .append('g')
            .append("path")
            .datum(data)
            .attr("d", d3.line()
                .x(d => that.x(new Date(d.date)))
                .y(d => that.y(+d.ATL6))
            )
            .attr("stroke", 'black')
            .style("stroke-width", 4)
            .style("fill", "none")
    }

    addInteractivity() {
        let id = this.element.substring(1, this.element.length)
        this.plot
            .append('rect')
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('id', `${id}Rect`)

        this.focus = this.svg
            .append('g')
            .append('circle')
            .style("fill", "white")
            .attr("stroke", "black")
            .attr('r', 6)
            .style("opacity", 0)

        // Create the text that travels along the curve of chart
        this.focusText = this.svg
            .append('text')
            .attr("x", this.margin.left)
            .attr("y", this.margin.top / 1.5 + 15)
            .style("opacity", 0)
            .style("font-size", "12px")
            .attr("text-anchor", "left")
            .attr("alignment-baseline", "middle")
            .attr('id', `${id}Text`)
    }

    updateInteractivity(data) {
        let that = this
        d3.select(this.element + "Rect")
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseout', mouseout);

        function mouseover() {
            that.focus.style("opacity", 1)
            that.focusText.style("opacity", 1)
        }

        function mousemove() {
            // recover coordinate we need
            let x0 = that.x.invert(d3.mouse(this)[0]);
            let selectedData;
            let format = d3.timeFormat("%Y-%m-%d");
            let i = that.bisect(data, format(x0), 1)
            selectedData = data[i]
            let date = new Date(selectedData.time)
            that.focus
                .attr("cx", that.x(date) + 40)
                .attr("cy", that.y(selectedData.value) + that.margin.top)

            // update text
            let formattedDate = d3.timeFormat("%m/%d")(date)
            let content = `Date:${formattedDate} Value:${d3.format('.1f')(selectedData.value)}`
            that.focusText.text(content)
        }

        function mouseout() {
            that.focus.style("opacity", 0)
            that.focusText.style("opacity", 0)
        }
    }

    addTitle() {
        d3.select(this.element).select('svg').append("text")
            .attr('class', 'ts-title')
            .attr("x", this.margin.left)
            .attr("y", this.margin.top / 1.5)
            .attr("text-anchor", "left")
            .style("font-size", "20px")
            .style("text-decoration", "underline")
            .text(this.title);
    }


    update(site) {
        let titleText = this.metric == 'hc' ?
            `${site}'s On-premise Headcount` :
            `${site}'s Production Attendance`
        this.svg.select('.ts-title')
            .text(titleText)

        // Create new data with the selection?
        let dataFilter = this.dataset.map(d => { return { time: d.date, value: d[site] } })
        // Rescale y-axis dynamically
        if (this.metric == 'hc') {
            // calculate 10% padding
            let curMax = d3.max(dataFilter, d => +d.value)
            let curPad = curMax * 0.1
            this.y.domain([0, curPad + curMax])
            this.yAxis.transition().duration(500).call(d3.axisLeft(this.y))
        };

        // Give these new data to update line
        const that = this
        this.line
            .datum(dataFilter)
            .transition()
            .duration(500)
            .attr("d", d3.line()
                .x(d => that.x(new Date(d.time)))
                .y(d => that.y(+d.value))
            )
            .attr("stroke", 'black')
        this.updateInteractivity(dataFilter)
    }

}