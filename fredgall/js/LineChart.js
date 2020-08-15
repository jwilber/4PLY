class LineChart {
	constructor(opts) {
		this.data = opts.data;
		this.element = opts.element;
		this.metric = opts.metric;

		const that = this;

		this.MARGIN = { TOP: 10, BOTTOM: 70, LEFT: 100, RIGHT: 30 };
		this.WIDTH = 800 - this.MARGIN.RIGHT - this.MARGIN.LEFT;
		this.HEIGHT = 500 - this.MARGIN.TOP - this.MARGIN.BOTTOM;

		this.svg = d3.select(this.element)
			.append('svg')
			.attr('width', this.WIDTH + this.MARGIN.LEFT + this.MARGIN.RIGHT)
			.attr('height', this.HEIGHT + this.MARGIN.TOP + this.MARGIN.BOTTOM)
			.append('g')
			.attr('transform', `translate(${this.MARGIN.LEFT}, ${this.MARGIN.TOP})`);

		// add text labels
		this.xLabel = this.svg.append('text')
			.attr('x', this.WIDTH / 2)
			.attr('y', this.HEIGHT + 50)
			.attr('text-anchor', 'middle')
			.text("Year")

		this.svg.append('text')
			.attr('x', - this.WIDTH / 2)
			.attr('y', -50)
			.attr('text-anchor', 'middle')
			.text('Count')
			.attr('transform', 'rotate(-90)')

		// preset axes
		this.xAxisGroup = this.svg.append('g')
			.attr('transform', `translate(0, ${this.HEIGHT})`);

		this.yAxisGroup = this.svg.append('g');

		this.tooltip = d3.select(this.element)
			.append('div')
			.attr('id', 'scatter-tooltip')
			.attr('class', 'tooltip')
			.style("opacity", 0)
			.style("pointer-events", "none")
			.style('font-size', '1rem')
			.style('text-align', 'left')
			.style('font-weight', 'bold');

		d3.csv('data2/obs_by_time.csv', data => {
			this.data = data;
			let metrics = [
				'bank',
				'flat',
				'gap',
				'ledge',
				'rail',
				'stairs',
				'transition',
				'wall'
			];
			// dropdown to select metric
			let currMetric = metrics[0];
			d3.select('#metric-select')
				.selectAll('options')
				.data(metrics)
				.enter()
				.append('option')
				.html(d => d);

			this.draw(currMetric);
		})


	}

	draw(currMetric) {
		const that = this;
		// set current data
		let currData = this.data.filter(d => d.obstacle == currMetric);

		const x = d3.scaleLinear()
			.domain([d3.min(currData, d => d.year) - 1,
			d3.max(currData, d => d.year)])
			.range([0, this.WIDTH]);

		const y = d3.scaleLinear()
			.domain([0,
				d3.max(currData, d => +d.cnt) + 3])
			.range([this.HEIGHT, 0]);

		this.lineActual = d3.line()
			.x(function (d) { return x(d.year) })
			.y(function (d) { return y(+d.cnt) })
			.curve(d3.curveStepBefore)

		const xAxisCall = d3.axisBottom(x).ticks(11).tickFormat(d3.format("d"));
		this.xAxisGroup.transition().duration(500).call(xAxisCall)

		const yAxisCall = d3.axisRight(y).tickSize(this.WIDTH + 10);
		this.yAxisGroup.transition().duration(500).call(yAxisCall)


		// handle circles
		// update circles
		let circles = this.svg.selectAll('circle.cnt')
			.data(currData, d => d.year);

		circles.exit().remove();

		let circlesEnter = circles
			.enter()
			.append('circle')
			.attr('class', 'cnt')
			.attr('fill', 'tan')
			.attr('r', 1)
			.attr('cx', d => x(d.year))
			.attr('cy', d => y(+d.cnt))


		circles = circles.merge(circlesEnter);

		circles.transition()
			.duration(800)
			.attr('cx', d => x(d.year))
			.attr('cy', d => y(+d.cnt))
			.attr('r', 12)
			.attr('stroke', 'tan')

		circles
			.on("mouseover", function (d) { // show it and update html
				let pointData = d;
				d3.selectAll('circle.cnt')
					.style('opacity', .2)
				d3.selectAll('path.met')
					.style('opacity', .2)
				d3.select(this)
					.style('opacity', 1)
				that.tooltip
					.transition()
					.style("opacity", .9);
				that.tooltip.html(function (d) { return pointData.cnt })
					.style("left", (d3.event.pageX) + "px")
					.style("top", (d3.event.pageY - 28) + "px");
			})
			.on("mouseout", function (d) {
				d3.selectAll('circle.cnt')
					.style('opacity', 1)
				d3.selectAll('path.met')
					.style('opacity', 1)
				that.tooltip.transition()
					.style("opacity", 0);
			})

		// add line chart
		let line = this.svg.selectAll('path.met')
			.data([currData]);

		let lineEnter = line.enter().append('path')
			.attr('class', 'met');

		line = line.merge(lineEnter);

		line.transition()
			.duration(1000)
			.attrTween('d', function (d) {
				var previous = d3.select(this).attr('d');
				var current = that.lineActual(d);
				return d3.interpolatePath(previous, current);
			})
			.style('stroke', 'tan')
			.style("stroke-width", 7)
			.style("fill", "none")
			.style('pointer-events', 'none')
			.attr('stroke-linejoin', 'round')
			.attr('active', true)
			.style('opacity', .85)


	}

}