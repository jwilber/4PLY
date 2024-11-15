document.addEventListener("DOMContentLoaded", function () {
    let data;
    let nodes = {};
    let links = [];
    let svg;
    let currentZoom = 1;
    let simulation;
    let originalNodeSizes = {}; // To store original node sizes
    let currentSearchTerm = ""; // To store current search term
    let selectedNode = null; // To track the currently selected node

    const infoDiv = d3.select("#info");
    const infoDivContainer = document.getElementById("info-container");
    const infoIcon = document.getElementById("info-icon");
    const closeButton = document.getElementById("info-close-btn");

    // Set initial display states
    infoDivContainer.style.display = "block";  // Show info container on load
    infoIcon.style.display = "none";           // Hide info icon on load

    // Close button event listener
    closeButton.addEventListener("click", function () {
        infoDivContainer.style.display = "none"; // Hide info container
        infoIcon.style.display = "flex";         // Show info icon
    });

    // Info icon event listener
    infoIcon.addEventListener("click", function () {
        infoDivContainer.style.display = "block"; // Show info container
        infoIcon.style.display = "none";          // Hide info icon
    });

    // Global color scale
    const colorScale = d3.scaleOrdinal()
        .domain([
            "favorite skater",
            "favorite style",
            "biggest influence",
            "most talented",
        ])
        .range(["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3"]);

    // Capitalize the first letter of each word in a name
    function capitalizeName(name) {
        return name
            .split(" ")
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1).toLowerCase()
            )
            .join(" ");
    }

    // Format a list of items separated by "/" and capitalize each item
    function formatList(list) {
        if (!list) return "None";
        return list
            .split("/")
            .map((item) => capitalizeName(item.trim()))
            .join(", ");
    }

    // Function to format the list of favorites in the guest section
    function formatFavoriteList(favoriteList, type) {
        if (favoriteList === "None") {
            return favoriteList;
        }
        const skaters = favoriteList.split(", ");
        const color = colorScale(type);
        return skaters
            .map(
                (name) =>
                    `<span class="clickable-skater" data-name="${name}" style="color: ${color};">${name}</span>`
            )
            .join(", ");
    }

    // Function to find who listed the skater as their favorite
    function findConnections(skater, type) {
        return data
            .filter(
                (d) =>
                    d[type] &&
                    d[type]
                        .split("/")
                        .map((name) => capitalizeName(name.trim()))
                        .includes(skater.name)
            )
            .map((d) => capitalizeName(d.guest))
            .sort();
    }

    // Load CSV data and process it
    d3.csv("skaters.csv").then(function (csvData) {
        data = csvData;
        processData(data); // Process the CSV data to create nodes and links
        renderChart(Object.values(nodes), links); // Render the initial chart
        updateStaticInfoDiv();
    });

    function processData(csvData) {
        nodes = {};
        links = {};

        // First pass: Create nodes and collect all guest names
        const guestNames = new Set(
            csvData.map((d) => capitalizeName(d.guest.trim()))
        );

        csvData.forEach(function (d) {
            const source = capitalizeName(d.guest.trim());
            const targets = {
                "favorite skater": d["favorite skater"],
                "favorite style": d["favorite style"],
                "biggest influence": d["biggest influence"],
                "most talented": d["most talented"],
            };

            // Parse season and episode
            const season = d["season"] ? d["season"].trim() : "";
            const episode = d["episode"] ? d["episode"].trim() : "";

            // Create or update the source node
            if (!nodes[source]) {
                nodes[source] = {
                    name: source,
                    size: 1,
                    connections: {},
                    guest: true,
                    season: season,
                    episode: episode,
                    "favorite skater": formatList(targets["favorite skater"]),
                    "favorite style": formatList(targets["favorite style"]),
                    "biggest influence": formatList(
                        targets["biggest influence"]
                    ),
                    "most talented": formatList(targets["most talented"]),
                };
            } else {
                // Update existing node with guest data
                nodes[source].guest = true;
                nodes[source].season = season || nodes[source].season;
                nodes[source].episode = episode || nodes[source].episode;
                nodes[source]["favorite skater"] = formatList(
                    targets["favorite skater"]
                );
                nodes[source]["favorite style"] = formatList(
                    targets["favorite style"]
                );
                nodes[source]["biggest influence"] = formatList(
                    targets["biggest influence"]
                );
                nodes[source]["most talented"] = formatList(
                    targets["most talented"]
                );
            }

            // Process each target list to create connections
            Object.keys(targets).forEach((type) => {
                processTargets(targets[type], type);
            });

            function processTargets(targetsList, type) {
                if (targetsList && targetsList.trim() !== "") {
                    const targetNames = targetsList.split("/");
                    targetNames.forEach(function (targetName) {
                        targetName = capitalizeName(targetName.trim());
                        if (!nodes[targetName]) {
                            nodes[targetName] = {
                                name: targetName,
                                size: 5,
                                connections: {},
                                guest: guestNames.has(targetName),
                            };
                        } else if (guestNames.has(targetName)) {
                            // Update existing node if it's a guest
                            nodes[targetName].guest = true;
                            const guestData = csvData.find(
                                (row) =>
                                    capitalizeName(row.guest.trim()) ===
                                    targetName
                            );
                            if (guestData) {
                                nodes[targetName]["favorite skater"] =
                                    formatList(guestData["favorite skater"]);
                                nodes[targetName]["favorite style"] =
                                    formatList(guestData["favorite style"]);
                                nodes[targetName]["biggest influence"] =
                                    formatList(
                                        guestData["biggest influence"]
                                    );
                                nodes[targetName]["most talented"] =
                                    formatList(guestData["most talented"]);
                                // Include season and episode
                                nodes[targetName].season =
                                    guestData["season"] || nodes[targetName].season;
                                nodes[targetName].episode =
                                    guestData["episode"] || nodes[targetName].episode;
                            }
                        }
                        nodes[targetName].connections[type] =
                            (nodes[targetName].connections[type] || 0) + 1.1;
                        links[`${source}-${targetName}-${type}`] = {
                            source: nodes[source],
                            target: nodes[targetName],
                            type: type,
                        };
                    });
                }
            }
        });

        // Convert links object to array
        links = Object.values(links);

      Object.values(nodes).forEach((node) => {
    const totalIncomingConnections = links.reduce(
        (acc, link) => acc + (link.target === node ? 1 : 0),
        0
    );

    // Nodes with no incoming connections get size 3
    // Nodes with incoming connections have a minimum size of 6 and scale from there
    node.size = totalIncomingConnections > 0 
        ? 6 + totalIncomingConnections 
        : 3;
});



Object.values(nodes).forEach(node => {
    const incoming = links.filter(link => link.target.name === node.name).length;
    console.log(`Node: ${node.name}, Size: ${node.size}, Incoming Connections: ${incoming}`);
});



    }

    let initialTopNodes = [];

    function renderChart(filteredNodes, filteredLinks, colorOverride = null) {
    svg = d3.select("svg");     
    svg.selectAll("*").remove(); // Clear the SVG before redrawing

    // Adjust width and height based on window size
    const isMobile = window.innerWidth <= 768;
    const width = isMobile ? window.innerWidth : window.innerWidth;
    const height = isMobile ? window.innerHeight : window.innerHeight;
    svg.attr("width", width).attr("height", height);

     initialTopNodes = [...filteredNodes]
        .sort((a, b) => b.size - a.size)
        .slice(0, 25)
        .map((node) => node.name); 

    // Adjust initial zoom level on mobile
    if (isMobile) {
        currentZoom = 0.7; // More zoomed out on mobile
    } else {
        currentZoom = 1;
    }

    svg.on("click", function (event) {
    // Check if the clicked target is the SVG itself (background)
    if (event.target === svg.node()) {
        console.log("Background clicked. Resetting chart.");
        
        // Reset selectedNode
        selectedNode = null;
        
        // Reset node, link, and label visibility
        node.style("display", "block"); // Show all nodes
        link.style("display", "block"); // Show all links

        // Show labels only for initial top nodes
        label.style("display", (d) => 
            initialTopNodes.includes(d.name) ? "block" : "none"
        );
        
        // Hide the info div
        infoDiv.classed("open", false); 
    }
});



simulation = d3
    .forceSimulation(filteredNodes)
    .force(
        "link",
        d3
            .forceLink(filteredLinks)
            .id((d) => d.name)
            .distance(100) // Distance between connected nodes
    )
    .force(
        "charge",
        d3.forceManyBody().strength((d) => -1000 * Math.sqrt(d.size)) // Repulsion depends on node size
    )
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX(width / 2).strength(0.1)) // X-axis force
    .force("y", d3.forceY(height / 2).strength(0.1)) // Y-axis force
    .force(
        "collision",
        d3
            .forceCollide()
            .radius((d) => Math.sqrt(d.size) * 15 + 15) // Collision radius depends on node size
    )
   .alpha(0.4) // Set the initial energy level (default is 1)
    .velocityDecay(0.8) // Slow down simulation decay
    .alphaDecay(0.01); // Stabilize simulation faster

if (isMobile) {
    simulation
        .force("charge", d3.forceManyBody().strength((d) => -70 * Math.sqrt(d.size))) // Repulsion force based on size
        .force("collision", d3.forceCollide().radius((d) => Math.sqrt(d.size) * 6 + 5)) // Increased collision radius to prevent overlap
        .force("link", d3.forceLink(filteredLinks).distance(26)) // Increase link distance
        .force("x", d3.forceX(width / 2).strength(0.42)) // Weaker x-axis force for mobile
        .force("y", d3.forceY(height / 2).strength(0.28)); // Weaker y-axis force for mobile
} else {
    simulation
        .force("charge", d3.forceManyBody().strength((d) => -80 * Math.sqrt(d.size))) // Repulsion force based on size
        .force("collision", d3.forceCollide().radius((d) => Math.sqrt(d.size) * 6 + 5)) // Increased collision radius to prevent overlap
        .force("link", d3.forceLink(filteredLinks).distance(30)) // Slightly increased link distance for better spacing
        .force("x", d3.forceX(width / 2).strength(0.18)) // Default x-axis force
        .force("y", d3.forceY(height / 2).strength(0.26)); // Default y-axis force
}




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
            .style("stroke", (d) => colorOverride || colorScale(d.type))
            .style("stroke-width", 1.5)
            .style("stroke-opacity", 0.6) // Adjust opacity for better readability
            .style("pointer-events", "none");

       const node = nodeGroup
    .selectAll(".node")
    .data(filteredNodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", (d) => d.size) // Use the size property directly

    .style("fill", (d) => (Object.values(d.connections).length === 0 ? "#333" : colorOverride || getNodeColor(d)))
    .style("filter", "none") // Disable the SVG filter
    .style("box-shadow", "0px 0px 10px 3px rgba(255, 255, 255, 0.6)") // Add CSS-based glow

            .call(
                d3
                    .drag()
                    .on("start", dragstarted) // Define drag start behavior
                    .on("drag", dragged) // Define drag behavior
                    .on("end", dragended) // Define drag end behavior
            )
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .attr("stroke", "#000")
                    .attr("stroke-width", 3); // Highlight node on hover
                labelGroup
                    .select(
                        `text[data-name='${d.name.replace(/'/g, "\\'")}']`
                    )
                    .style("display", "block"); // Show label on hover

                // Add pulse animation to connected links
                const connectedLinks = link.filter(
                    (l) => l.source === d || l.target === d
                );
                connectedLinks.classed("pulse", true);
            })
            .on("mouseout", function (event, d) {
                if (!currentSearchTerm && !d.fx) {
                    d3.select(this)
                        .attr("stroke", null)
                        .attr("stroke-width", null); // Remove highlight
                    labelGroup
                        .select(
                            `text[data-name='${d.name.replace(/'/g, "\\'")}']`
                        )
                        .style("display", d.topNode ? "block" : "none"); // Hide label if not dragged or a top node
                } else if (currentSearchTerm) {
                    labelGroup
                        .select(
                            `text[data-name='${d.name.replace(/'/g, "\\'")}']`
                        )
                        .style("display", (d) =>
                            d.name.toLowerCase().includes(currentSearchTerm)
                                ? "block"
                                : "none"
                        );
                }

                // Remove pulse animation from connected links if node is not selected
                if (selectedNode !== d) {
                    const connectedLinks = link.filter(
                        (l) => l.source === d || l.target === d
                    );
                    connectedLinks.classed("pulse", false);
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
    .attr("text-anchor", "middle") // Center horizontally
    .attr("dy", ".35em") // Center vertically within the node
    .style("user-select", "none")
    .style("pointer-events", "none")
    .style("display", (d) => {
        if (currentSearchTerm) {
            return d.name.toLowerCase().includes(currentSearchTerm)
                ? "block"
                : "none";
        }
        return d.topNode || d.fx ? "block" : "none";
    })
    .style("font-size", isMobile ? "21px" : "16px") // Set font size dynamically
    .style("fill", "white") // Black text fill
    .style("stroke", "black") // White stroke
    .style("stroke-width", "5px") // Stroke thickness
    .style("paint-order", "stroke")
    .style("text-shadow", "0px 0px 15px rgba(255, 255, 255, 0.2)"); // Soft glow



        // Show labels for top 20 nodes on load
        function consistentLabelDisplay() {
            const topNodes = [...filteredNodes]
                .sort((a, b) => b.size - a.size)
                .slice(0, 25); // Get top 20 nodes by size
            topNodes.forEach((node) => (node.topNode = true)); // Mark nodes as top nodes for label display
            label.filter((d) => d.topNode).style("display", "block"); // Display labels for top nodes
        }

        if (!currentSearchTerm) {
            consistentLabelDisplay();
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

        function handleNodeClick(d) {
            console.log("Node clicked:", d);

            // Reset previous highlighting
            resetNodeStyles();

            selectedNode = d; // Set the selected node

            label.style("display", (labelNode) => 
    labelNode.name === d.name ? "block" : labelNode.topNode ? "block" : "none"
);


            // Proceed with highlighting connected nodes
            const connectedNodes = new Set();
            connectedNodes.add(d);

            // Highlight nodes and links connected to the clicked node
            links.forEach((link) => {
                if (link.source.name === d.name || link.target.name === d.name) {
                    connectedNodes.add(link.source);
                    connectedNodes.add(link.target);
                }
            });

// Update to manage visibility dynamically
node.style("display", (n) => connectedNodes.has(n) ? "block" : "none");
link.style("display", (l) => 
    (connectedNodes.has(l.source) && connectedNodes.has(l.target)) ? "block" : "none"
);
label.style("display", (l) => connectedNodes.has(l) ? "block" : "none");



            // Add pulse animation to connected links
            const connectedLinks = link.filter(
                (l) => l.source === d || l.target === d
            );
            connectedLinks.classed("pulse", true);

            // Collect and display skater's info in a clean format
            const guestInfo = d.guest
                ? `<span class='guest-label'>Guest - Season ${d.season || "N/A"}, Episode ${d.episode || "N/A"}</span>
                        <div class="guest-info">
                            <h3>Favorites</h3>
                            <ul>
                                <li><strong>Favorite Skater:</strong> ${
                                    formatFavoriteList(
                                        d["favorite skater"] || "None",
                                        "favorite skater"
                                    )
                                }</li>
                                <li><strong>Favorite Style:</strong> ${
                                    formatFavoriteList(
                                        d["favorite style"] || "None",
                                        "favorite style"
                                    )
                                }</li>
                                <li><strong>Biggest Influence:</strong> ${
                                    formatFavoriteList(
                                        d["biggest influence"] || "None",
                                        "biggest influence"
                                    )
                                }</li>
                                <li><strong>Most Talented:</strong> ${
                                    formatFavoriteList(
                                        d["most talented"] || "None",
                                        "most talented"
                                    )
                                }</li>
                            </ul>
                        </div>`
                : `<span class='not-guest-label'>Not a Guest</span>`;

            const skatersWhoFavor = {
                "favorite skater": findConnections(d, "favorite skater"),
                "favorite style": findConnections(d, "favorite style"),
                "biggest influence": findConnections(d, "biggest influence"),
                "most talented": findConnections(d, "most talented"),
            };

            let favoritesInfo = "<div class='favorites-info'>";
            if (
                Object.values(skatersWhoFavor).some(
                    (list) => list.length > 0
                )
            ) {
                favoritesInfo += "<h3>Mentioned By</h3>";
            }
            Object.entries(skatersWhoFavor).forEach(([type, list]) => {
                if (list.length > 0) {
                    favoritesInfo += `<p><strong>${capitalizeName(
                        type.replace("_", " ")
                    )} (${list.length}):</strong> 
                        <span style="color: ${colorScale(type)};">${list
                        .map(
                            (name) =>
                                `<span class="clickable-skater" data-name="${name}">${name}</span>`
                        )
                        .join(", ")}</span></p>`;
                }
            });
            favoritesInfo += "</div>";

            // Update the info div content
            infoDiv.html(`
                    <button id="close-btn" class="close-btn">X</button>
                    <h2 class="info-title">${d.name}</h2>
                    <div class="guest-status">${guestInfo}</div>
                    ${favoritesInfo}
                `);

            console.log("Sliding info div open...");

 // Check if we're on mobile
const isMobile = window.innerWidth <= 768;

if (isMobile) {
    infoDiv.classed("open", true); // Open the node info div for mobile
    d3.select("#info-container").classed("open", false); // Close the main info container for mobile
} else {
    infoDiv.classed("open", true); // Open the node info div for desktop
}

console.log("Info div content updated and open class added.");

d3.select("#close-btn").on("click", function () {
    console.log("Close button clicked. Closing info div...");
    infoDiv.classed("open", false); // Hide the node info div

    // Ensure no extra labels are shown
    // label.style("display", (d) =>
    //     initialTopNodes.includes(d.name) ? "block" : "none"
    // );

    console.log("Info div closed and label state preserved.");
});





            // Add event listeners to clickable skater names
            infoDiv.selectAll(".clickable-skater").on("click", function () {
                const skaterName = d3.select(this).attr("data-name");
                const skaterNode = nodes[skaterName];
                if (skaterNode) {
                    handleNodeClick(skaterNode); // Click the corresponding skater node
                }
            });

            // Center the chart on the clicked node on mobile
            if (isMobile) {
                const width = parseInt(svg.attr("width"));
                const height = parseInt(svg.attr("height"));
                const scale = currentZoom; // Use the current zoom level
                const translate = [
                    width / 2 - d.x * scale,
                    height / 2 - d.y * scale
                ];
                svg.transition()
                    .duration(750)
                    .call(
                        zoom.transform,
                        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
                    );
            }
        }

        // Function to reset node, link, and label styles
        function resetNodeStyles() {
    console.log("Resetting node, link, and label styles...");
    selectedNode = null; // Clear the selected node

    // Reset nodes and links to be visible
    node.style("display", "block");
    link.style("display", "block");

    // Display labels only for the initial top nodes
    label.style("display", (d) => 
        initialTopNodes.includes(d.name) ? "block" : "none"
    );

    console.log("Styles reset.");
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

        // Apply initial zoom based on currentZoom
        svg.call(zoom.scaleTo, currentZoom);

       

        // Reset Positions button functionality
        d3.select("#reset-positions").on("click", function () {
            // Reset all nodes to their original floating state
            Object.values(nodes).forEach((d) => {
                d.fx = null;
                d.fy = null;
            });
            simulation.alpha(1).restart(); // Restart the simulation
        });

        // Search functionality mapped to Enter key
        d3.select("#search").on("keypress", function (event) {
            if (event.key === "Enter") {
                d3.select("#search-button").dispatch("click");
            }
        });

        // Search button functionality
d3.select("#search-button").on("click", function () {
    currentSearchTerm = d3
        .select("#search")
        .property("value")
        .toLowerCase()
        .trim(); // Get the search term

    if (!currentSearchTerm) {
        console.log("Search term is empty. Resetting chart.");
        currentSearchTerm = "";
        renderChart(Object.values(nodes), links); // Reset the chart
        return;
    }

    const searchedNodes = Object.values(nodes).filter((d) =>
        d.name.toLowerCase().includes(currentSearchTerm)
    );

    if (searchedNodes.length > 0) {
        console.log("Search results:", searchedNodes);

        // Create a set of connected nodes and links
        const connectedNodes = new Set(searchedNodes);
        const connectedLinks = links.filter(
            (link) =>
                connectedNodes.has(link.source) ||
                connectedNodes.has(link.target)
        );
        connectedLinks.forEach((link) => {
            connectedNodes.add(link.source);
            connectedNodes.add(link.target);
        });

        // Update chart to show only relevant nodes and links
        node.style("display", (n) => (connectedNodes.has(n) ? "block" : "none"));
        link.style("display", (l) =>
            connectedLinks.includes(l) ? "block" : "none"
        );
        label.style("display", (l) =>
            searchedNodes.includes(l) ? "block" : "none"
        );

        // Highlight labels for searched nodes
        label.filter((d) => searchedNodes.includes(d)).style("display", "block");
    } else {
        console.log("No results found for the search term: " + currentSearchTerm);
        currentSearchTerm = "";
        renderChart(Object.values(nodes), links); // Reset the chart
    }
});


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
    // Reset node sizes to original sizes and recalculate sizes if necessary
    Object.values(nodes).forEach((node) => {
        const totalIncomingConnections = links.reduce(
            (acc, link) => acc + (link.target === node ? 1 : 0),
            0
        );
        node.size = totalIncomingConnections > 0
            ? 6 + totalIncomingConnections
            : 3;
    });

    // Render the chart with all nodes and links
    renderChart(Object.values(nodes), links);
    highlightActiveButton("#all");
});


        d3.select("#guests-only").on("click", function () {
    const filteredNodes = Object.values(nodes).filter((node) => node.guest);
    const filteredLinks = links.filter(
        (link) => link.source.guest && link.target.guest
    );

    // Adjust node sizes for "guests only" filter
    filteredNodes.forEach((node) => {
        const incomingConnections = filteredLinks.reduce(
            (acc, link) => acc + (link.target === node ? 1 : 0),
            0
        );

        // Minimum size of 5 for all guest nodes
        // Scale up by 3 for each incoming connection
        node.size = Math.max(5, 6 + incomingConnections * 3);
    });

    console.log("Guests-only nodes:", filteredNodes);
    console.log("Guests-only links:", filteredLinks);

    // Render the chart with filtered nodes and links
    renderChart(filteredNodes, filteredLinks);
    highlightActiveButton("#guests-only");
});


        // Highlight the active button
        function highlightActiveButton(buttonId) {
            d3.selectAll(".button").style("border", "none");
            d3.select(buttonId).style("border", "2px solid white");
        }

        function filterByType(type, color) {
    console.log("Filtering by type: " + type);
    const filteredLinks = links.filter((link) => link.type === type);
    const filteredNodes = new Set();

    // Add nodes connected by the filtered links
    filteredLinks.forEach((link) => {
        filteredNodes.add(link.source);
        filteredNodes.add(link.target);
    });

    // Recalculate node sizes for filtered nodes
    filteredNodes.forEach((node) => {
        const incomingConnections = filteredLinks.reduce(
            (acc, link) => acc + (link.target === node ? 1 : 0),
            0
        );
        node.size = incomingConnections > 0 ? 6 + incomingConnections : 3;
    });

    console.log("Filtered nodes:", Array.from(filteredNodes));
    console.log("Filtered links:", filteredLinks);

    // Render chart with filtered nodes and links
    renderChart(Array.from(filteredNodes), filteredLinks, color);
}


    }
document.addEventListener("DOMContentLoaded", function () {
    const infoDivContainer = d3.select("#info-container");
    const infoIcon = d3.select("#info-icon");

    // Function to update the content of the static info div
    function updateStaticInfoDiv() {
        infoDivContainer.html(`
            <button id="info-close-btn" class="close-btn">X</button>
            <h2>The Bunt Skater Network</h2>
            <p>This network visualizes relationships among professional skateboarders 
            based on influences, favorite styles, and talents shared on "The Bunt" podcast, 
            specifically from the rapid-fire segment covering Seasons 1-18. Each node represents 
            a skater. Lines connect skaters through admiration or inspiration, with colors representing 
            different connection types: favorite skater, favorite style, biggest influence, and most 
            talented.</p>
            
            <p>Special thanks to <strong>DumbData</strong> for supplying most of the data. 
            You can see his breakdown 
            <a href="https://www.youtube.com/watch?v=iki3IqO7PfQ" target="_blank">here</a>.</p>
            
            <h3>How to Explore:</h3>
            <ul>
                <li><strong>Hover Over Nodes:</strong> Highlights a skater's immediate connections.</li>
                <li><strong>Click Nodes:</strong> Opens a panel showing the skater's favorites 
                and who has mentioned them.</li>
                <li><strong>Search:</strong> Find a specific skater and view their network.</li>
            </ul>
        `);

        // Event listener for the close button to close info-container and show info icon
        d3.select("#info-close-btn").on("click", function() {
            infoDivContainer.classed("open", false); // Slide out info-container
            infoIcon.style("display", "flex"); // Show the info icon
        });
    }

    updateStaticInfoDiv();

    // Event listener for info-icon to reopen the info-container
    infoIcon.on("click", function () {
        infoDivContainer.classed("open", true); // Slide in info-container
        infoIcon.style("display", "none"); // Hide the info icon
        console.log("clicked");
    });
});


// ... your existing code above ...

document.addEventListener("DOMContentLoaded", function () {
    const infoDivContainer = d3.select("#info-container");
    const infoIcon = d3.select("#info-icon");

    // Open the info container on load
    infoDivContainer.classed("open", true);
    infoIcon.style("display", "none"); // Hide icon initially

    // Event listener for the close button inside #info-container
    d3.select("#info-close-btn").on("click", function() {
        infoDivContainer.classed("open", false); // Close the container
        infoIcon.style("display", "block"); // Show the info icon to reopen it
    });

    // Event listener for the info icon to reopen the container
    infoIcon.on("click", function () {
        infoDivContainer.classed("open", true); // Open the container
        infoIcon.style("display", "none"); // Hide the info icon
    });
});



});
