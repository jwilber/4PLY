class Table {
    constructor(opts) {
        this.data = opts.data;
        this.element = opts.element;
        this.columns = opts.columns;

        d3.csv(this.data, data => {
            this.data = data;
            this.draw('AMXL');
        })
    }

    draw() {
        const that = this;
        let newData = this.data;

        let table = d3.select(this.element)
            .append('table')
            .style('width', 100)
            .attr('class', 'table')

        let thead = table.append('thead')
        this.tbody = table.append('tbody');

        // add table columns
        thead.append('tr')
            .selectAll('th')
            .data(this.columns)
            .enter()
            .append('th')
            .text(column => column)
            .style('text-align', (d, i) => i == 0 ? 'left' : 'right')

        this.rows = this.tbody.selectAll('tr')
            .data(newData);

        let rowsEnter = this.rows.enter()
            .append('tr')
            .attr('class', 'table-row')


        let cells = rowsEnter.selectAll('td')
            .data(row => {
                return this.columns.map(column => {
                    return { column: column, value: row[column] };
                });
            })
            .enter()
            .append('td')
            .text(function (d) {
                return d.value;
            })
            .style('text-align', (d, i) => (i % 9 == 0) ? 'left' : 'right')


    }
}
