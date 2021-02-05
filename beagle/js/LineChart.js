class LineChart {
	constructor(opts) {
		this.data = opts.data;
		this.element = opts.element;
		this.metric = opts.metric;
		this.dropdown = opts.dropdown;
		this.xValue = opts.xValue;
		this.yValue = opts.yValue;
		this.title = opts.title;

		const that = this;

		this.MARGIN = { TOP: 10, BOTTOM: 70, LEFT: window.innerWidth / 9.5 + 5, RIGHT: window.innerWidth / 9 };
		const width = window.innerWidth < 1000 ? (window.innerWidth / 1.05) : (window.innerWidth / 1.3)
		this.WIDTH = width - this.MARGIN.RIGHT - this.MARGIN.LEFT;
		this.HEIGHT = (window.innerHeight / 1.6) - this.MARGIN.TOP - this.MARGIN.BOTTOM;

		this.svg = d3.select(this.element)
			.append('svg')
			.attr("preserveAspectRatio", "xMinYMin meet")
			.attr('width', this.WIDTH + this.MARGIN.LEFT + this.MARGIN.RIGHT)
			.attr('height', this.HEIGHT + this.MARGIN.TOP + this.MARGIN.BOTTOM)
			.attr("viewBox", `0 0 ${this.WIDTH + this.MARGIN.LEFT + this.MARGIN.RIGHT} ${this.HEIGHT + this.MARGIN.TOP + this.MARGIN.BOTTOM}`)
			.append('g')
			.attr('transform', `translate(${this.MARGIN.LEFT}, ${this.MARGIN.TOP})`);

		// add text labels
		this.xLabel = this.svg.append('text')
			.attr('x', this.WIDTH / 2)
			.attr('y', this.HEIGHT + 50)
			.attr('text-anchor', 'middle')
			.text("Year")
			.style('font-size', '1rem')


		if (this.title) {
			this.svg.append('text')
				.attr('x', this.WIDTH / 2)
				.attr('y', this.MARGIN.TOP - 2)
				.attr('text-anchor', 'middle')
				.style('text-decoration', 'underline')
				.text(this.title)
				.style('font-size', '1rem');
		}


		this.svg.append('text')
			.attr('x', - this.HEIGHT / 2)
			.attr('y', -30)
			.attr('text-anchor', 'middle')
			.text('Percentage')
			.attr('transform', 'rotate(-90)')
			.style('font-size', '1rem');


		// preset axes
		this.xAxisGroup = this.svg.append('g')
			.attr('transform', `translate(0, ${this.HEIGHT})`);

		this.yAxisGroup = this.svg.append('g');

		this.tooltip = d3.select(this.element)
			.append('div')
			.attr('id', this.dropdown)
			.attr('class', 'tooltip')
			.style("opacity", 0)
			.style("pointer-events", "none")
			.style('font-size', '1rem')
			.style('text-align', 'left')
			.style('font-weight', 'bold')
			;


		d3.csv(this.data, data => {
			this.data = data;
			if (this.dropdown) {
				this.metrics = [...new Set(data.map(d => d.obstacle))];
				// dropdown to select metric
				d3.select('#metric-select')
					.selectAll('options')
					.data(this.metrics)
					.enter()
					.append('option')
					.html(d => d);
			}

			this.draw(this.metric);
		})


	}

	draw(currMetric) {
		const t = d3.transition().duration(1100).ease(d3.easeBack);
		const that = this;
		// this.title.text(`${currMetric} Counts`)
		// set current data
		let currData = this.data.filter(d => d.obstacle == currMetric);

		const x = d3.scaleLinear()
			.domain([d3.min(currData, d => d[this.xValue]) - 1,
			d3.max(currData, d => d[this.xValue])])
			.range([0, this.WIDTH]);

		const y = d3.scaleLinear()
			.domain([0,
				d3.max(currData, d => +d[this.yValue]) + 3])
			.range([this.HEIGHT, 0]);

		this.lineActual = d3.line()
			.x(function (d) { return x(d[that.xValue]) })
			.y(function (d) { return y(+d[that.yValue]) })
			.curve(d3.curveCatmullRom.alpha(.5))

		const xAxisCall = d3.axisBottom(x).ticks(4).tickFormat(d3.format("d"));
		this.xAxisGroup.transition().duration(500).call(xAxisCall)

		const yAxisCall = d3.axisLeft(y);
		this.yAxisGroup.transition().duration(500).call(yAxisCall)



		// add line chart
		let line = this.svg.selectAll('path.met')
			.data([currData]);

		let lineEnter = line.enter().append('path')
			.attr('class', 'met');

		line = line.merge(lineEnter);

		line.transition(t)
			.attrTween('d', function (d) {
				var previous = d3.select(this).attr('d');
				var current = that.lineActual(d);
				return d3.interpolatePath(previous, current);
			})
			.style('stroke', 'green')
			.style("stroke-width", window.innerWidth < 1000 ? 4 : 7)
			.style("fill", "none")
			.style('pointer-events', 'none')
			.attr('stroke-linejoin', 'round')
			.attr('active', true)
			.style('opacity', .85)


		// handle circles
		// update circles
		let circles = this.svg.selectAll(`circle.${this.yValue}`)
			.data(currData, d => d[this.xValue]);

		circles.exit().remove();

		let circlesEnter = circles
			.enter()
			.append('circle')
			.attr('class', 'cnt')
			.attr('fill', 'yellow')
			.style('stroke', 'green')

			.attr('r', 1)
			.attr('cx', d => x(d[that.xValue]))
			.attr('cy', d => y(+d[that.yValue]))



		circles = circles.merge(circlesEnter);

		circles.transition(t)
			.attr('cx', d => x(d[that.xValue]))
			.attr('cy', d => y(+d[that.yValue]))
			.attr('r', window.innerWidth < 1000 ? 5 : 10)
			.attr('stroke-width', 3)
			.attr('stroke', 'white')

		circles
			.on("mouseover", function (d) { // show it and update html
				let pointData = d;
				d3.selectAll(`circle.${this.yValue}`)
					.style('opacity', 0)
				d3.selectAll(`circle.cnt`)
					.style('opacity', .2)
				d3.selectAll('path.met')
					.style('opacity', .2)
				d3.select(this)
					.style('opacity', .7)
				that.tooltip
					.transition()
					.style("opacity", .9);
				that.tooltip.html(function (d) { 
					let value = Math.round(pointData[that.yValue]) 
					return `${value}%`
				})
					 .style("left", (d3.event.pageX + 10) + "px")
					 .style("top", (d3.event.pageY - 10) + "px")
					;
			})
			.on("mouseout", function (d) {
				d3.selectAll(`circle.cnt`)
					.style('opacity', 1)
				d3.selectAll('path.met')
					.style('opacity', 1)
				that.tooltip.transition()
					.style("opacity", 0)
				;
			})

		


	}

}