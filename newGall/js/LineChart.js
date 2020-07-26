class LineChart {
	constructor(opts) {
		this.data = opts.data;
		this.element = opts.element;
		this.metric = opts.metric;

		const that = this;

		d3.csv(this.data, data => {
			console.log(data);

			this.draw();
		})
	}

	draw() {
		var aspectRatio= '16:9';
var viewBox = '0 0 ' + aspectRatio.split(':').join(' ');
		const that = this;
		this.margin = { top: 10, right: 30, bottom: 60, left: 100 },
		this.chartWidth = 900 - this.margin.left - this.margin.right,
		this.chartHeight = 500 - this.margin.top - this.margin.bottom;

		this.chart = d3.select(this.element)
			.append("svg")
			// .attr('id', 'lineSvg')
			.attr('width', (this.chartWidth + this.margin.left + this.margin.right))
			.attr('height', (this.chartHeight + this.margin.top + this.margin.bottom))
			.style('background-color', 'pink')
		  .attr("viewBox", `0 0  
		  	${(this.chartWidth + this.margin.left + this.margin.right)} 
		  	${(this.chartHeight + this.margin.top + this.margin.bottom)}`
		  	)

		}
}