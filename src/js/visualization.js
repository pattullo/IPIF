// Import Cytoscape library (if using npm/modules)
// import cytoscape from 'cytoscape';
// Example layout extension import (if using npm/modules)
// import dagre from 'cytoscape-dagre';
// cytoscape.use(dagre); // Register extension before use

// Helper function (can be inside or outside initializeVisualization scope)
export function getLearningItemsFromElements(elements) {
    // Filter out edges and map nodes back to their original data structure
     if (!elements || typeof elements.nodes !== 'function') {
         console.warn("getLearningItemsFromElements: Invalid elements object received.");
         return [];
     }
    return elements.nodes().map(node => node.data());
}

// Function to fetch and process learning data
async function fetchData(url = './data/sample-data.json') { // <-- Corrected path HERE
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} loading ${url}`);
        }
        const data = await response.json();
        console.log("Data fetched successfully:", data);

        // --- Data Transformation (if needed) ---
        if (data.learning_items && !data.elements) {
            console.log("Transforming learning_items to elements array...");
            const nodes = data.learning_items.map(item => ({ data: item }));
            const edges = [];

            nodes.forEach(node => {
                // Prerequisites
                if (node.data.prerequisites && Array.isArray(node.data.prerequisites)) {
                    node.data.prerequisites.forEach(prereqId => {
                        if (nodes.some(n => n.data.id === prereqId)) {
                           edges.push({ data: { id: `edge-prereq-${prereqId}-${node.data.id}`, source: prereqId, target: node.data.id, type: 'prerequisite' } });
                        } else { console.warn(`Prerequisite source node '${prereqId}' not found for target '${node.data.id}'.`); }
                    });
                }
                // Maintenance Contributions
                 if (node.data.maintenance_contribution_for && Array.isArray(node.data.maintenance_contribution_for)) {
                    node.data.maintenance_contribution_for.forEach(targetCertId => {
                        if (nodes.some(n => n.data.id === targetCertId)) {
                            edges.push({ data: { id: `edge-maint-${node.data.id}-${targetCertId}`, source: node.data.id, target: targetCertId, type: 'maintenance' } });
                        } else { console.warn(`Maintenance target node '${targetCertId}' not found for source '${node.data.id}'.`); }
                    });
                }
            });
            return { nodes, edges }; // Return in Cytoscape elements format
        } else if (data.elements && data.elements.nodes && data.elements.edges) {
             console.log("Data is already in elements format.");
            return data.elements;
        } else if(Array.isArray(data) && data.length > 0 && data[0].group && (data[0].group === 'nodes' || data[0].group === 'edges')) {
             console.log("Data appears to be a direct elements array.");
             return data;
         } else {
             throw new Error("Invalid or unrecognized data format in JSON file. Expected 'learning_items' array or Cytoscape 'elements' structure.");
         }

    } catch (error) {
        console.error("Could not fetch or process data:", error);
        return { nodes: [], edges: [] };
    }
}


// Main function to initialize Cytoscape, exported for use in main.js
export async function initializeVisualization(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Container element '${containerSelector}' not found.`);
        return null;
    }

    const graphElements = await fetchData(); // Uses corrected path internally

    if (!graphElements || !Array.isArray(graphElements.nodes)) {
        console.error("Failed to get valid graph data structure. Cannot initialize visualization.");
         if(container) container.innerHTML = 'Error: Invalid data structure received.';
        return null;
    }

     console.log(`Initializing Cytoscape in container '${containerSelector}'...`);

    try {
        const cy = cytoscape({
            container: container,
            elements: graphElements,

            // --- STYLING ---
             style: [
                 { selector: 'node', style: { 'background-color': '#888', 'label': 'data(name)', 'width': '80px', 'height': '80px', 'font-size': '10px', 'color': '#fff', 'text-outline-color': '#000', 'text-outline-width': 1, 'text-valign': 'bottom', 'text-halign': 'center', 'text-margin-y': '5px', 'text-wrap': 'wrap', 'text-max-width': '75px' }},
                 { selector: 'node[status="Completed"]', style: { 'background-color': '#4CAF50' } },
                 { selector: 'node[status="In Progress"]', style: { 'background-color': '#FFC107' } },
                 { selector: 'node[status="Planned"]', style: { 'background-color': '#9E9E9E' } },
                 { selector: 'node[status="Expired"]', style: { 'background-color': '#F44336', 'border-width': 2, 'border-color': '#000' } },
                 { selector: 'node[type="Certification"]', style: { 'shape': 'hexagon' } },
                 { selector: 'node[type="Course"]', style: { 'shape': 'rectangle' } },
                 { selector: 'node[type="Milestone"]', style: { 'shape': 'star' } },
                 { selector: 'node[type="MaintenanceActivity"]', style: { 'shape': 'diamond' } },
                 { selector: 'node[type="Skill"]', style: { 'shape': 'round-tag' } },
                 { selector: 'node[type="Module"]', style: { 'shape': 'round-rectangle' } },
                 { selector: 'node:selected', style: {'border-width': 3, 'border-color': '#03A9F4'} },
                 { selector: 'node.hover', style: {'background-color': '#03A9F4'} },
                 { selector: '.updated', style: {'border-color': 'orange', 'border-width': 4} }, // For visual feedback on save
                 { selector: 'edge', style: { 'width': 2, 'line-color': '#ccc', 'curve-style': 'bezier' } },
                 { selector: 'edge[type="prerequisite"]', style: { 'line-color': '#999', 'target-arrow-shape': 'triangle', 'target-arrow-color': '#999', 'arrow-scale': 1.2 } },
                 { selector: 'edge[type="maintenance"]', style: { 'line-color': '#2196F3', 'line-style': 'dotted', 'target-arrow-shape': 'triangle', 'target-arrow-color': '#2196F3', 'arrow-scale': 1.2 } },
                 { selector: 'edge.highlighted', style: { 'line-color': '#FF5722', 'width': 4 } }
             ],

            // --- LAYOUT ---
            layout: {
                name: 'dagre',
                rankDir: 'LR',
                spacingFactor: 1.3,
            }
        });

        // --- Optional: Add basic interactions ---
        cy.on('mouseover', 'node', (event) => event.target.addClass('hover'));
        cy.on('mouseout', 'node', (event) => event.target.removeClass('hover'));

        console.log("Cytoscape initialization complete.");

        // Fit/center view after layout calculation
         cy.ready(() => {
            console.log("Graph ready, fitting view.");
             cy.fit(null, 50);
         });

        cy.resize();

        return { cy: cy }; // Return object containing the instance

    } catch (error) {
        console.error("Error initializing Cytoscape:", error);
        if (container) container.innerHTML = `Error initializing Cytoscape: ${error.message}`;
        return null;
    }
}