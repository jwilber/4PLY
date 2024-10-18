document.addEventListener("DOMContentLoaded", function () {
    let data;
    let nodes = {};
    let links = [];
    let svg;
    let currentZoom = 1;
    let simulation;

    const tooltip = d3.select("#tooltip");
    const infoDiv = d3.select("#info");
    const infoDivContainer = d3.select("#info-container");

    // Load CSV data and process it
    d3.csv("skaters.csv").then(function (csvData) {
        data = csvData;
        processData(data); // Process the CSV data to create nodes and links
        renderChart(Object.values(nodes), links); // Render the initial chart
        updateStaticInfoDiv();
    });

    function processData(csvData) {
        nodes = {};
        links = [];

        csvData.forEach(function (d) {
            const source = capitalizeName(d.guest.trim()); // Capitalize the guest's name and trim whitespace
            const targets1 = d["favorite skater"];
            const targets2 = d["favorite style"];
            const targets3 = d["biggest influence"];
            const targets4 = d["most talented"];

            if (source) {
                // Create a node if it doesn't exist
                if (!nodes[source]) {
                    nodes[source] = {
                        name: source,
                        size: 1, // Set a minimum size of 1
                        connections: {},
                        guest: true, // Mark as guest since it's in the guest column
                        "favorite skater": formatList(d["favorite skater"]),
                        "favorite style": formatList(d["favorite style"]),
                        "biggest influence": formatList(d["biggest influence"]),
                        "most talented": formatList(d["most talented"]),
                    };
                }

                // Process each target list to create connections
                function processTargets(targets, type) {
                    if (targets && targets.trim() !== "") {
                        const targetNames = targets.split("/");
                        targetNames.forEach(function (targetName) {
                            targetName = capitalizeName(targetName.trim()); // Capitalize the target name and trim whitespace
                            if (!nodes[targetName]) {
                                nodes[targetName] = {
                                    name: targetName,
                                    size: 1, // Set a minimum size of 1
                                    connections: {},
                                    guest: csvData.some(row => capitalizeName(row.guest.trim()) === targetName), // Check if this target is also a guest
                                };
                            }
                            nodes[targetName].connections[type] =
                                (nodes[targetName].connections[type] || 0) + 1; // Increment the connection count
                            if (nodes[source] && nodes[targetName]) {
                                links.push({
                                    source: nodes[source],
                                    target: nodes[targetName],
                                    type: type,
                                });
                            }
                        });
                    }
                }

                // Process connections for each type
                processTargets(targets1, "favorite skater");
                processTargets(targets2, "favorite style");
                processTargets(targets3, "biggest influence");
                processTargets(targets4, "most talented");
            }
        });

        // Update node sizes based on incoming connections only
        Object.values(nodes).forEach(node => {
            node.size = Object.values(node.connections).reduce((acc, count) => acc + count, 0) || 1; // Set size equal to number of connections, with a minimum of 1
        });
    }

    function renderChart(filteredNodes, filteredLinks, colorOverride = null) {
        svg = d3.select("svg");
        svg.selectAll("*").remove(); // Clear the SVG before redrawing
        const width = window.innerWidth * 0.75;
        const height = window.innerHeight;
        svg.attr("width", width).attr("height", height);

        const colorScale = d3
            .scaleOrdinal()
            .domain([
                "favorite skater",
                "favorite style",
                "biggest influence",
                "most talented",
            ])
            .range(["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3"]); // Set color for each connection type

        // Define arrow markers for links
        svg.append("defs")
            .selectAll("marker")
            .data([
                "favorite skater",
                "favorite style",
                "biggest influence",
                "most talented",
            ])
            .enter()
            .append("marker")
            .attr("id", (d) => `arrowhead-${d}`)
            .attr("viewBox", "-0 -5 10 10")
            .attr("refX", 13)
            .attr("refY", 0)
            .attr("orient", "auto")
            .attr("markerWidth", 5)
            .attr("markerHeight", 5)
            .attr("xoverflow", "visible")
            .append("svg:path")
            .attr("d", "M 0,-5 L 10 ,0 L 0,5")
            .attr("fill", (d) => colorScale(d))
            .style("stroke", "none");

        // Set up the force simulation for nodes and links
        simulation = d3
            .forceSimulation(filteredNodes)
            .force(
                "link",
                d3
                    .forceLink(filteredLinks)
                    .id((d) => d.name)
                    .distance(20) // Set a shorter distance for better compactness
            )
            .force("charge", d3.forceManyBody().strength(-30)) // Adjust charge strength for better node clustering
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force(
                "x",
                d3.forceX(width / 2).strength(0.05)
            )
            .force(
                "y",
                d3.forceY(height / 2).strength(0.05)
            )
            .force(
                "collision",
                d3.forceCollide().radius((d) => Math.sqrt(d.size) * 5 + 5) // Reduce collision radius for tighter network
            )
            .velocityDecay(0.4) // Adjust velocity decay for smoother layout
            .alphaDecay(0.02); // Adjust alphaDecay for more stability

        // Create groups for links, nodes, and labels
        const linkGroup = svg.append("g").attr("class", "links");
        const nodeGroup = svg.append("g").attr("class", "nodes");
        const labelGroup = svg.append("g").attr("class", "labels");

        // Draw the links
        const link = linkGroup
            .selectAll(".link")
            .data(filteredLinks)
            .enter()
            .append("line")
            .attr("class", "link")
            .attr("marker-end", (d) =>
                d.type ? `url(#arrowhead-${d.type})` : null
            )
            .style("stroke", (d) => colorOverride || colorScale(d.type))
            .style("stroke-width", 1.5)
            .style("stroke-opacity", 0.6) // Adjust opacity for better readability
            .style("pointer-events", "none");

        // Draw the nodes
        const node = nodeGroup
            .selectAll(".node")
            .data(filteredNodes)
            .enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", (d) => Math.max(d.size, 5)) // Node radius based on size, with a minimum size of 5
            .style("fill", (d) => {
                if (Object.values(d.connections).length === 0) return "#333"; // Black if not mentioned by others
                return colorOverride || getNodeColor(d);
            })
            .call(
                d3
                    .drag()
                    .on("start", dragstarted) // Define drag start behavior
                    .on("drag", dragged) // Define drag behavior
                    .on("end", dragended) // Define drag end behavior
            )
            .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke", "#000").attr("stroke-width", 3); // Highlight node on hover
                labelGroup.select(`text[data-name='${d.name.replace(/'/g, "\\'") }']`).style("display", "block"); // Show label on hover
            })
            .on("mouseout", function (event, d) {
                if (!d3.select("#search").property("value") && !d.fx) {
                    d3.select(this).attr("stroke", null).attr("stroke-width", null); // Remove highlight
                    labelGroup.select(`text[data-name='${d.name.replace(/'/g, "\\'") }']`).style("display", d.topNode ? "block" : "none"); // Hide label if not dragged or a top node
                }
            })
            .on("click", function (event, d) {
                handleNodeClick(d); // Handle node click to update info div
                d3.select(this).attr("r", Math.max(d.size + 4, 5)); // Increase node size when selected
            });

        // Draw the labels
        const label = labelGroup
            .selectAll(".label")
            .data(filteredNodes)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("data-name", (d) => d.name)
            .text((d) => d.name)
            .attr("dx", 12)
            .attr("dy", ".35em")
            .style("user-select", "none")
            .style("pointer-events", "none")
            .style("display", (d) => (d.topNode || d.fx) ? "block" : "none") // Show labels for top nodes and dragged nodes by default
            .style("font-size", "14px")
            .style("fill", "#ffffff")
            .style("text-shadow", "1px 1px 3px #000000"); // Improve readability of labels

        // Show labels for top 20 nodes on load
        function consistentLabelDisplay() {
            const topNodes = [...filteredNodes].sort((a, b) => b.size - a.size).slice(0, 20); // Get top 20 nodes by size
            topNodes.forEach(node => node.topNode = true); // Mark nodes as top nodes for label display
            label.filter(d => d.topNode).style("display", "block"); // Display labels for top nodes
        }

        consistentLabelDisplay();

        // Info window logic with simplified formatting
        function handleNodeClick(d) {
            console.log("Node clicked:", d);
            const connectedNodes = new Set();
            connectedNodes.add(d);

            // Highlight nodes and links connected to the clicked node
            links.forEach((link) => {
                if (link.source.name === d.name || link.target.name === d.name) {
                    connectedNodes.add(link.source);
                    connectedNodes.add(link.target);
                }
            });

            // Set opacity of unrelated nodes and links to 0
            node.style("opacity", (n) => (connectedNodes.has(n) ? 1 : 0));
            link.style("opacity", (l) =>
                connectedNodes.has(l.source) && connectedNodes.has(l.target) ? 1 : 0
            );
            label.style("opacity", (l) => (connectedNodes.has(l) ? 1 : 0));

            // Collect and display skater's info in a clean format
            const guestInfo = d.guest
                ? `<span style='color: #28a745; font-weight: bold;'>Guest</span><br>
                    <div style="margin-top: 10px;">
                        <p><strong>Favorite Skater:</strong> ${formatFavoriteList(d["favorite skater"] || "None")}</p>
                        <p><strong>Favorite Style:</strong> ${formatFavoriteList(d["favorite style"] || "None")}</p>
                        <p><strong>Biggest Influence:</strong> ${formatFavoriteList(d["biggest influence"] || "None")}</p>
                        <p><strong>Most Talented:</strong> ${formatFavoriteList(d["most talented"] || "None")}</p>
                    </div>`
                : `<span style='color: #dc3545; font-weight: bold;'>Not Guest</span>`;

            const skatersWhoFavor = {
                "favorite skater": findConnections(d, "favorite skater"),
                "favorite style": findConnections(d, "favorite style"),
                "biggest influence": findConnections(d, "biggest influence"),
                "most talented": findConnections(d, "most talented"),
            };

            let favoritesInfo = "<div style='margin-top: 20px;'>";
            if (Object.values(skatersWhoFavor).some(list => list.length > 0)) {
                favoritesInfo += "<h3>Incoming Connections</h3>";
            }
            Object.entries(skatersWhoFavor).forEach(([type, list]) => {
                if (list.length > 0) {
                    favoritesInfo += `<p><strong>${capitalizeName(type.replace('_', ' '))}:</strong> 
                    ${list.map(name => `<span class="clickable-skater" data-name="${name}" style="font-weight: bold; text-decoration: underline; cursor: pointer;">${name}</span>`).join(", ")}</p>`;
                }
            });
            favoritesInfo += "</div>";

            // Update the info div content
            infoDiv.html(`
                <h2 style="text-align: center; font-family: 'Courier New', monospace; color: #ffffff;">${d.name}</h2>
                <p>${guestInfo}</p>
                ${favoritesInfo}
                <button id="close-btn" style="margin-top: 20px; font-size: 12px; background-color: #333; color: #fff; border: none; padding: 10px; border-radius: 5px; cursor: pointer;">Close</button>
            `);

            // Add console logs to track sliding behavior
            console.log("Sliding info div open...");
            infoDiv.style("background-color", "#000").classed("open", true)
                .style("z-index", "10") // Ensure the info div is above other content
                .style("transform", "translateX(0)") // Slide the info div over the info-container
                .style("transition", "transform 0.4s ease-in-out");
            console.log("Info div content updated and open class added.");

            d3.select("#close-btn").on("click", function () {
                console.log("Close button clicked. Closing info div...");
                infoDiv.classed("open", false)
                    .style("transform", "translateX(100%)") // Slide the info div back to its hidden position
                    .style("z-index", "0");
                resetNodeStyles(); // Reset the styles of all nodes and links
                console.log("Info div closed and styles reset.");
                d3.selectAll(".node").attr("r", (n) => Math.max(n.size, 5)); // Reset node size when deselected
            });

            // Add event listeners to clickable skater names
            infoDiv.selectAll(".clickable-skater").on("click", function () {
                const skaterName = d3.select(this).attr("data-name");
                const skaterNode = nodes[skaterName];
                if (skaterNode) {
                    handleNodeClick(skaterNode); // Click the corresponding skater node
                }
            });
        }

        // Click listener to deselect node when clicking on background
        svg.on("click", function (event) {
            if (event.target === svg.node()) {
                console.log("SVG background clicked. Closing info div...");
                infoDiv.classed("open", false)
                    .style("transform", "translateX(100%)") // Slide the info div back to its hidden position
                    .style("z-index", "0");
                resetNodeStyles(); // Reset the styles of all nodes and links
                console.log("Info div closed and styles reset.");
                d3.selectAll(".node").attr("r", (n) => Math.max(n.size, 5)); // Reset node size when deselected
            }
        });

        // Function to reset node, link, and label styles
        function resetNodeStyles() {
            console.log("Resetting node, link, and label styles...");
            node.style("opacity", 1); // Reset node opacity
            link.style("opacity", 1); // Reset link opacity
            label.filter(d => d.topNode || d.fx).style("display", "block"); // Show labels for top nodes or dragged nodes
            console.log("Styles reset.");
        }

        // Function to find who listed the skater as their favorite
        function findConnections(skater, type) {
            return data
                .filter((d) => d[type] && d[type].split("/").map(capitalizeName).includes(skater.name))
                .map((d) => capitalizeName(d.guest))
                .sort();
        }

        // Function to format the list of favorites in the guest section
        function formatFavoriteList(favoriteList) {
            if (favoriteList === "None") {
                return favoriteList;
            }
            const skaters = favoriteList.split(", ");
            return skaters.map(name => `<span class="clickable-skater" data-name="${name}" style="font-weight: bold; text-decoration: underline; cursor: pointer;">${name}</span>`).join(", ");
        }

        // Handle filtering by metric
        d3.select("#favourite").on("click", function () {
            filterByType("favorite skater", "#66c2a5");
            highlightActiveButton("#favourite");
        });

        d3.select("#style").on("click", function () {
            filterByType("favorite style", "#fc8d62");
            highlightActiveButton("#style");
        });

        d3.select("#influence").on("click", function () {
            filterByType("biggest influence", "#8da0cb");
            highlightActiveButton("#influence");
        });

        d3.select("#talent").on("click", function () {
            filterByType("most talented", "#e78ac3");
            highlightActiveButton("#talent");
        });

        d3.select("#all").on("click", function () {
            renderChart(Object.values(nodes), links); // Reset the chart when "All" is clicked
            highlightActiveButton("#all");
        });

        // Handle filtering by guests only
        d3.select("#guests-only").on("click", function () {
            const filteredNodes = Object.values(nodes).filter(node => node.guest);
            const filteredLinks = links.filter(link => link.source.guest && link.target.guest);
            renderChart(filteredNodes, filteredLinks);
            highlightActiveButton("#guests-only");
        });

        // Highlight the active button
        function highlightActiveButton(buttonId) {
            d3.selectAll(".button").style("border", "none");
            d3.select(buttonId).style("border", "2px solid black");
        }

        // Filter by connection type and redraw the chart
        function filterByType(type, color) {
            console.log("Filtering by type: " + type);
            const filteredLinks = links.filter((link) => link.type === type);
            const filteredNodes = new Set();

            // Add nodes connected by the filtered links
            filteredLinks.forEach((link) => {
                filteredNodes.add(link.source);
                filteredNodes.add(link.target);
            });

            console.log("Filtered nodes:", Array.from(filteredNodes));
            console.log("Filtered links:", filteredLinks);
            filteredNodes.forEach((node) => {
                node.size = Math.max(1, filteredLinks.reduce((acc, link) => acc + (link.target === node ? 1 : 0), 0));
            });

            renderChart(Array.from(filteredNodes), filteredLinks, color); // Redraw with filtered nodes, links, and color
        }

        // Determine node color based on most common connection type
        function getNodeColor(d) {
            if (Object.keys(d.connections).length === 0) return "#cccccc"; // Grey for no connections
            let maxCount = 0;
            let commonType = "";
            for (const [type, count] of Object.entries(d.connections)) {
                if (count > maxCount) {
                    maxCount = count;
                    commonType = type;
                }
            }
            return colorScale(commonType); // Color based on the most common connection type
        }

        // Update positions of nodes, links, and labels on each tick of the simulation
        function ticked() {
            link.attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);

            node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

            label.attr("x", (d) => d.x).attr("y", (d) => d.y); // Ensure labels follow nodes
        }

        simulation.on("tick", ticked); // Attach the tick function to the simulation

        // Define behavior when dragging starts
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart(); // Restart simulation with higher alpha
            d.fx = d.x;
            d.fy = d.y;
        }

        // Define behavior while dragging
        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        // Define behavior when dragging ends
        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0); // Lower alpha to stop the simulation
            // Keep the node in the dragged position
            d.fx = d.x;
            d.fy = d.y;
        }

        // Set up zoom functionality
        const zoom = d3.zoom()
            .scaleExtent([0.5, 8]) // Define zoom scale limits
            .on("zoom", function (event) {
                currentZoom = event.transform.k;
                nodeGroup.attr("transform", event.transform);
                linkGroup.attr("transform", event.transform);
                labelGroup.attr("transform", event.transform);
            });

        svg.call(zoom).on("dblclick.zoom", null); // Attach zoom behavior and disable double-click zoom

        // Zoom buttons functionality
        d3.select("#zoom-in").on("click", function () {
            currentZoom = Math.min(currentZoom * 1.2, 8);
            svg.transition().duration(500).call(zoom.scaleTo, currentZoom);
        });

        d3.select("#zoom-out").on("click", function () {
            currentZoom = Math.max(currentZoom / 1.2, 0.5);
            svg.transition().duration(500).call(zoom.scaleTo, currentZoom);
        });

        d3.select("#reset-zoom").on("click", function () {
            currentZoom = 1;
            svg.transition().duration(500).call(zoom.scaleTo, currentZoom);
        });

        // Add a Reset Positions button to reset node positions
        d3.select("body").append("button")
            .attr("id", "reset-positions")
            .text("Reset Positions")
            .style("position", "fixed")
            .style("bottom", "20px")
            .style("left", "20px")
            .style("padding", "10px")
            .style("background-color", "#333")
            .style("color", "#fff")
            .style("border", "none")
            .style("border-radius", "5px")
            .style("cursor", "pointer")
            .style("z-index", "10") // Ensure button is on top of SVG
            .on("click", function () {
                // Reset all nodes to their original floating state
                Object.values(nodes).forEach(d => {
                    d.fx = null;
                    d.fy = null;
                });
                simulation.alpha(1).restart(); // Restart the simulation
            });

        // Move filtering buttons to the bottom of the page, centered
        d3.select("#buttons")
            .style("position", "fixed")
            .style("bottom", "60px")
            .style("left", "35%") // Adjusted position for better centering
            .style("transform", "translateX(-50%)")
            .style("z-index", "10")
            .style("display", "flex")
            .style("justify-content", "center");

        // Search functionality mapped to Enter key
        d3.select("#search").on("keypress", function (event) {
            if (event.key === "Enter") {
                d3.select("#search-button").dispatch("click");
            }
        });

        // Move search container to the top center of the page
        d3.select(".search-container")
            .style("position", "fixed")
            .style("top", "10px")
            .style("left", "50%")
            .style("transform", "translateX(-50%)")
            .style("z-index", "10");

        // Search button functionality
        d3.select("#search-button").on("click", function () {
            const searchTerm = d3.select("#search").property("value").toLowerCase();
            const searchedNodes = Object.values(nodes).filter((d) =>
                d.name.toLowerCase().includes(searchTerm)
            );

            if (searchedNodes.length > 0) {
                console.log("Search results:", searchedNodes);
                const connectedNodes = new Set();
                searchedNodes.forEach((node) => {
                    connectedNodes.add(node);
                    links.forEach((link) => {
                        if (link.source.name === node.name || link.target.name === node.name) {
                            connectedNodes.add(link.source);
                            connectedNodes.add(link.target);
                        }
                    });
                });

                const filteredNodes = Array.from(connectedNodes);
                const filteredLinks = links.filter(
                    (link) =>
                        connectedNodes.has(link.source) && connectedNodes.has(link.target)
                );

                renderChart(filteredNodes, filteredLinks); // Redraw chart with filtered nodes and links
                label.style("display", (d) =>
                    searchedNodes.some(node => node.name === d.name) ? "block" : "none"
                ); // Only show labels that match the search term
            } else {
                console.log("No results found for the search term: " + searchTerm);
            }
        });

        // Function to smoothly center nodes on the screen
        function smoothCentering(nodesToCenter) {
            const xPositions = nodesToCenter.map(node => node.x);
            const yPositions = nodesToCenter.map(node => node.y);
            const avgX = xPositions.reduce((sum, val) => sum + val, 0) / xPositions.length;
            const avgY = yPositions.reduce((sum, val) => sum + val, 0) / yPositions.length;
            svg.transition().duration(1000).call(zoom.transform, d3.zoomIdentity.translate(width / 2 - avgX, height / 2 - avgY));
        }
    }

    // Capitalize the first letter of each word in a name
    function capitalizeName(name) {
        return name.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
    }

    // Format a list of items separated by "/" and capitalize each item
    function formatList(list) {
        if (!list) return "None";
        return list.split("/").map(item => capitalizeName(item.trim())).join(", ");
    }

    function updateStaticInfoDiv() {
        const numSkaters = Object.keys(nodes).length;
        const numConnections = links.length;
        const averageConnections = (numConnections / numSkaters).toFixed(2);
        const mostConnectedSkater = Object.values(nodes).reduce((maxNode, node) => (node.size > maxNode.size ? node : maxNode), { size: 0 });

        infoDivContainer.html(`
            <h2>Your Favourite Skater's Favourite Skater</h2>
            <p>This network chart visualizes the relationships between skaters and their favorite skaters, styles, influences, and talents. Click on a node to see more information about a skater and their connections. Use the filters below to explore different relationships and see how the skateboarding community is connected.</p>
            <div class="fun-facts">
                <h3>Fun Facts:</h3>
                <p><strong>Total Skaters:</strong> ${numSkaters}</p>
                <p><strong>Total Connections:</strong> ${numConnections}</p>
                <p><strong>Most Connected Skater:</strong> ${mostConnectedSkater.name} (${mostConnectedSkater.size} connections)</p>
            </div>
        `);
    }

    // Apply dark mode styling to the chart
    d3.select("body").style("background-color", "#121212").style("color", "#ffffff");
    d3.selectAll(".button").style("background-color", "").style("color", "").style("border", "");
    svg.style("background-color", "#1e1e1e");

    // Update the static info div to be fixed to the right
    infoDivContainer
        .style("position", "fixed")
        .style("top", "0")
        .style("right", "0")
        .style("width", "25%")
        .style("height", "100%")
        .style("padding", "20px")
        .style("background-color", "#1e1e1e")
        .style("color", "#ffffff")
        .style("overflow-y", "auto")
        .style("z-index", "5");
});
