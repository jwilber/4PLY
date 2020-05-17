
// start network.js here
class NetworkGraph {

    constructor(opts) {
        // load in arguments from config object
        this.data = opts.data
        this.element = opts.element
        // create the chart
        const that = this
        d3.json(this.data, (error, data) => {
            if (error) {
                console.log(error)
            }
            that.draw(data)
            // that.makeLegend()
        })
    }

    draw(data) {
        // define width, height and margin
        const that = this
        this.linkedByIndex = {}
        this.showEdges = true
        this.edgeStrokeOp = 0.15
        this.nodes = null
        this.labels = null
        this.edges = null
        this.width = window.innerWidth / 1.1
        this.height = window.innerHeight + 100
        this.tooltip = floatingTooltip('network-tooltip', 50)
        // set up parent element and SVG
        this.svg = d3.select(this.element).append('svg')
        // .style('background-color', 'white')
        this.svg.attr('width', this.width)
        this.svg.attr('height', this.height)
        // add edges g
        this.svg.append('g')
            .attr('class', 'edges')
        // add nodes g
        this.svg.append('g')
            .attr('class', 'nodes')

        // need to define ticked and ended here
        // because SyntaxError: Fields are currently not supported (Safari, Firefox)
        this.addIterationFuncs()

        this.addHoverFuncs()
        // set up force stuff
        this.simulation = d3.forceSimulation()
            .velocityDecay(.945)
            .alphaMin(0.0001)
            .on('tick', this.ticked)
            .on('end', this.ended)
        this.simulation.stop()
        this.charge = d => -Math.pow(d.radius, 2.0) * 10.5


        // ADD SCALES
        this.colorScale = d3.scaleOrdinal()
            .domain([1, 2, 3, 4, 5, 6, 7])
            .range(['red', 'orange', 'yellow', 'blue', 'green', 'purple', 'skyblue'])

        this.attendanceScale = d3.scalePow()
            .exponent(0.5)
            .range([4, 23])

        this.countScale = d3.scalePow()
            .domain([1, 10])
            .exponent(0.5)
            .range([3, 30])

        this.distanceScale = d3.scaleLinear()
            .range([0, this.height / 1.85])

        this.allData = this.setupData(data)

        // render the network
        this.render()

        // highlight buttons on hover
        // TODO: Wrap as function? Or serve in index.html?
        d3.selectAll('#filters a').on('click', function () {
            let newFilter = d3.select(this).attr('id')
            that.activate('filters', newFilter)
            d3.selectAll('circle.node')
                .transition()
                .duration(500)
                .attr('r', d => this.countScale(+d.radius))
                .style('stroke-width', 2)
                .transition()
                .duration(500)
                .style('stroke-width', 1)
                .attr('r', d => this.countScale(+d.radius))
        })

    }

    activate(group, link) {
        d3.selectAll(`#${group} a`)
            .classed('active', false)
        d3.select(`#${group} #${link}`)
            .classed('active', true)
    }

    addIterationFuncs() {
        this.ticked = () => {
            this.nodes
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)

            this.labels
                .attr('x', d => d.x)
                .attr('y', d => {
                    let padding = d.cnt < 2 ? 18 : 30;
                    return d.y + padding + (4 * d.cnt)
                })

            if (this.showEdges) {
                this.edges
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y)
            } else {
                this.edges
                    .attr('x1', 0)
                    .attr('y1', 0)
                    .attr('x2', 0)
                    .attr('y2', 0)
            }
        }

        this.ended = () => {
            this.showEdges = true
            this.ticked()
        }
    }


    neighboring(a, b) {
        return this.linkedByIndex[a.id + '_' + b.id] ||
            this.linkedByIndex[b.id + '_' + a.id]
    }
    setupData(data) {
        for (let i = 0; i < data.nodes.length; i++) {
            data.nodes[i].x = 4 * Math.random() * (this.width / 2)
            data.nodes[i].y = 2 * Math.random() * (this.height / 2)
        }

        // ADD SCALE DOMAINS
        // identify current scale to use

        // set up distance scale
        this.distanceExtent = d3.extent(data.links, d => d.distance)
        this.distanceScale.domain(this.distanceExtent)
        // 
        data.nodes.forEach(n => {
            // add radius to the node so we can use it later
            n.radius = this.countScale(+n.cnt)
        })

        this.nodesMap = d3.map(data.nodes, d => d.id)

        data.links.forEach(l => {
            l.source = this.nodesMap.get(l.source)
            l.target = this.nodesMap.get(l.target)
            l.id = l.source.id + '_' + l.target.id

            // linkedByIndex is used for link sorting
            this.linkedByIndex[l.id] = 1
        })
        return data
    } // setupData

    addHoverFuncs() {
        this.highlightNode = (d) => {
            let content = `<p>Skater: ${d.name}</p>`
            content += `<p>Count: ${d.cnt}</p>`
            this.tooltip.showTooltip(content, d3.event)
            if (this.showEdges) {
                this.edges
                    .style('stroke', l => (l.source.id === d.id || l.target.id === d.id) ? '#555' : '#ddd')
                    .style('stroke-opacity', l => (l.source.id === d.id || l.target.id === d.id) ? 1.0 : this.edgeStrokeOp)
                // higlight connected nodes
                this.nodes
                    .style('stroke', n => (d.id === n.id || n.searched || this.neighboring(d, n)) ? 'grey' : 'pink')
                    .style('stroke-width', n => (d.id === n.id || n.searched || this.neighboring(d, n)) ? 3.0 : 2.0)
            }
        }

        this.unhighlightNode = () => {
            this.tooltip.hideTooltip()

            // reset edges
            this.edges
                .style('stroke', '#ddd')
                .style('stroke-opacity', this.edgeStrokeOp)

            // reset nodes
            this.nodes
                .style('stroke', 'pink')
                .style('stroke-width', 1.0)
        }
    }


    setupNetworkLayout(edgesData) {
        let linkForce = d3.forceLink()
            .distance(e => this.distanceScale(e.distance) + 0)
            .strength(.25)
            .links(edgesData)

        this.simulation.force('links', linkForce)
        // setup a center force to keep nodes
        this.simulation.force('center', d3.forceCenter(this.width / 2, (this.height / 2) - 50))

        // increase chargePowerto spread nodes 
        this.simulation.force('charge', d3.forceManyBody().strength(this.charge))
        this.simulation.force('x', d3.forceX(this.width / 2).strength(0.01))
        this.simulation.force('y', d3.forceY(this.height / 2).strength(0.05))
        this.simulation.force('collision', d3.forceCollide(50))

    }

    renderLabels(nodesData) {
        this.labels = this.svg.select('.nodes').selectAll('.nodeLabel')
            .data(nodesData)

        let labelsE = this.labels.enter().append('g').append("text")
            .classed('nodeLabel', true)
            .attr('x', d => d.x)
            .attr('y', d => d.y)

        this.labels.exit().remove()

        this.labels = this.labels.merge(labelsE)
            .text(d => d.name) // if add text before merge, will get wrong labeling
            .style("text-anchor", "middle")
            .style("fill", "#555")
            .style("font-family", "Bungee")
            .style("font-size", '0.64rem')
            .style('fill', 'black')
            .style('pointer-events', 'none')
    }

    renderNodes(nodesData) {
        this.nodes = this.svg.select('.nodes').selectAll('.node')
            .data(nodesData)

        let nodesE = this.nodes.enter().append('circle')
            .classed('node', true)
            .attr('site', d => d.name)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .on('mouseover', this.highlightNode)
            .on('mouseout', this.unhighlightNode)

        this.nodes.exit().remove()

        this.nodes = this.nodes.merge(nodesE)
            .attr('r', d => this.countScale(+d.radius))
            .style('fill', d => 'pink')
            // .style('fill', d => this.colorScale(+d.radius))
            .style('stroke', 'pink')
            // .style('stroke', function (d) { return strokeFor(d) })
            .style('stroke-width', 2.0)
            .style('opacity', 0.8)
    }


    renderEdges(edgesData) {
        this.edges = this.svg.select('.edges').selectAll('.edge')
            .data(edgesData, d => d.id)

        let edgesE = this.edges.enter().append('line')
            .classed('edge', true)
            .style('stroke', '#d9d9d9')
            .style('stroke-opacity', this.edgeStrokeOp)

        this.edges.exit().remove()

        this.edges = this.edges.merge(edgesE)
    }

    render() {
        this.filteredNodes = this.allData.nodes
        this.filteredEdges = this.filterEdges(this.allData.links, this.filteredNodes)

        this.simulation.nodes(this.filteredNodes)

        this.setupNetworkLayout(this.filteredEdges)

        this.renderNodes(this.filteredNodes)
        this.renderLabels(this.filteredNodes)
        this.renderEdges(this.filteredEdges)

        //  set alpha of the simulation when we restart.
        this.simulation.alpha(1).restart()
    }

    filterEdges(edgesData, nodesData) {
        this.nodesMap = d3.map(nodesData, d => d.id)
        let newEdgesData = edgesData.filter(d => {
            return this.nodesMap.get(d.source.id) && this.nodesMap.get(d.target.id)
        })
        return newEdgesData
    }


    updateData(newData) {
        this.allData = this.setupData(newData)
        this.render()
    }

}


// https://observablehq.com/@d3/click-vs-drag