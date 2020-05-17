makeTable = (data, columns) => {
    let table = d3.select('#table')
        .append('table')
        .style('width', `${window.innerWidth / 3.6 - 40}px`)
    let thead = table.append('thead')
    let tbody = table.append('tbody');

    // append the header row
    thead.append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
        .text(column => column)
        .style('text-align', (d, i) => i == 0 ? 'left' : 'right')

    // create a row for each object in the data
    let rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');

    // create a cell in each row for each column
    let cells = rows.selectAll('td')
        .data(row => {
            return columns.map(column => {
                return { column: column, value: row[column] };
            });
        })
        .enter()
        .append('td')
        .text(d => d.value)
        .style('text-align', (d, i) => i == 0 ? 'left' : 'right')


    table
        .attr('class', 'daily-table')

    return table;
}

d3.json('data/loyalty_index.json', data => {
    // render the table(s)
    makeTable(data, ['filmmaker', 'loyalty_index']); // 2 column table

});
