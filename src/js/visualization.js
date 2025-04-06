// Import Cytoscape library (if using npm/modules)
// import cytoscape from 'cytoscape';
// Import and register layout extensions like dagre (if using npm/modules)
// import dagre from 'cytoscape-dagre';
// cytoscape.use(dagre); // Register the layout algorithm

// Import the styles defined in styles.js
import { ipifStyles } from './styles.js';

// Helper function to extract original learning items from Cytoscape elements
export function getLearningItemsFromElements(elements) {
    if (!elements || typeof elements.nodes !== 'function') {
        console.warn("getLearningItemsFromElements: Invalid elements object received.");
        return [];
    }
    // Filter out edges AND parent nodes, map child nodes back to their original data structure
    return elements.nodes().filter(node => !node.data('isParent')).map(node => node.data());
}

// Function to fetch and process learning data for compound layout
async function fetchData(url = './data/sample-data.json') { // Correct path
    try {
        const response = await fetch(url);
        if (!response.ok) { throw new Error(`HTTP error! status: ${response.status} loading ${url}`); }
        const data = await response.json();
        console.log("Data fetched successfully (size check):", data?.learning_items?.length || 'N/A', "items");

        // --- Data Transformation for Compound Nodes ---
        if (data.learning_items) {
            console.log("Transforming learning_items to elements array with compound parents...");
            const learningItems = data.learning_items;
            const uniqueDomains = [...new Set(learningItems.map(item => item.domain || 'Uncategorized'))].sort();
            const parentNodes = uniqueDomains.map((domainName, index) => ({ data: { id: `domain-${domainName.replace(/[^a-zA-Z0-9]/g, '-')}`, name: domainName, isParent: true, class: index % 2 === 0 ? 'domain-even' : 'domain-odd' }}));
            const childNodes = learningItems.map(item => {
                const domainName = item.domain || 'Uncategorized';
                const parentId = `domain-${domainName.replace(/[^a-zA-Z0-9]/g, '-')}`;
                const { isParent, ...itemData } = item;
                return { data: { ...itemData, parent: parentId } };
            });
            const edges = [];
            childNodes.forEach(node => { /* ... edge creation logic ... */
                 if (node.data.prerequisites && Array.isArray(node.data.prerequisites)) { node.data.prerequisites.forEach(prereqId => { if (childNodes.some(n => n.data.id === prereqId)) { edges.push({ data: { id: `edge-prereq-${prereqId}-${node.data.id}`, source: prereqId, target: node.data.id, type: 'prerequisite' } }); } else { console.warn(`Prereq source node '${prereqId}' not found for target '${node.data.id}'.`); } }); }
                 if (node.data.maintenance_contribution_for && Array.isArray(node.data.maintenance_contribution_for)) { node.data.maintenance_contribution_for.forEach(targetCertId => { if (childNodes.some(n => n.data.id === targetCertId)) { edges.push({ data: { id: `edge-maint-${node.data.id}-${targetCertId}`, source: node.data.id, target: targetCertId, type: 'maintenance' } }); } else { console.warn(`Maint target node '${targetCertId}' not found for source '${node.data.id}'.`); } }); }
             });
            const elements = [...parentNodes, ...childNodes, ...edges];
            return { elements, uniqueDomains };

        } else { /* ... handle other data formats or errors ... */ }

    } catch (error) {
        console.error("Could not fetch or process data:", error);
        return { elements: [], uniqueDomains: [] };
    }
}


// Main function to initialize Cytoscape
export async function initializeVisualization(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) { console.error(/*...*/); return null; }

    const { elements: graphElements, uniqueDomains } = await fetchData();

    if (!Array.isArray(graphElements)) { /* ... error handling ... */ return null; }

    console.log(`Initializing Cytoscape with ${graphElements.length} elements...`);

    try {
        const cy = cytoscape({
            container: container,
            elements: graphElements,

            // --- STYLING ---
            // Use the imported styles from styles.js
            style: ipifStyles,

            // --- LAYOUT ---
            layout: {
                name: 'dagre',
                rankDir: 'LR',
                fit: false, // Manual fitting
                padding: 50,
                spacingFactor: 1.25,
                nodeSep: 60,
                edgeSep: 10,
                rankSep: 80,
            }
        }); // End Cytoscape Constructor

        // --- Optional: Basic Interactions ---
        cy.on('mouseover', 'node[!isParent]', (event) => event.target.addClass('hover'));
        cy.on('mouseout', 'node[!isParent]', (event) => event.target.removeClass('hover'));

        console.log("Cytoscape core initialization complete.");

        // --- Adjust Initial View using cy.ready() ---
        cy.ready(function() {
            console.log("cy.ready() called. Adjusting initial view...");
            setTimeout(() => {
                console.log("Adjusting viewport inside setTimeout after cy.ready...");

                const padding = { top: 30, right: 30, bottom: 30, left: 15 }; // Fine-tuned padding
                const extraHorizontalOffset = 10; // Fine-tuned offset
                console.log(`Using Settings: Padding=${JSON.stringify(padding)}, ExtraOffset=${extraHorizontalOffset}`);

                const bb = cy.elements().boundingBox();
                console.log("Model Bounding Box (bb):", JSON.stringify(bb));

                if (bb.w === 0 || bb.h === 0) { /* ... error handling ... */ cy.center(); return; }

                const viewportHeight = cy.height();
                const availableHeight = viewportHeight - padding.top - padding.bottom;

                if (availableHeight <= 0 || bb.h <= 0) { /* ... error handling ... */ cy.center(); return; }

                const targetZoomY = availableHeight / bb.h;
                const targetZoom = Math.max(0.1, Math.min(1.5, targetZoomY)); // Limit zoom
                console.log(`Calculated Zoom (targetZoom): ${targetZoom.toFixed(3)}`);

                // Calculate pan based on model coordinates and target zoom
                const targetPanX = padding.left + extraHorizontalOffset - (bb.x1 * targetZoom);
                const targetPanY = (viewportHeight / 2) - ((bb.y1 + bb.h / 2) * targetZoom);
                console.log(`Calculated Pan: targetPanX=${targetPanX.toFixed(2)}, targetPanY=${targetPanY.toFixed(2)}`);

                // Apply zoom and pan together
                cy.viewport({ zoom: targetZoom, pan: { x: targetPanX, y: targetPanY } });
                console.log("Viewport set.");

                console.log(`Final Viewport: Zoom=${cy.zoom().toFixed(3)}, Pan=(${cy.pan().x.toFixed(0)}, ${cy.pan().y.toFixed(0)})`);

            }, 100); // 100ms delay

        }); // End cy.ready()

        cy.resize();

        return { cy: cy }; // Return object

    } catch (error) {
        console.error("Error initializing Cytoscape:", error);
        if (container) container.innerHTML = `Error initializing Cytoscape: ${error.message}`;
        return null;
    }
} // End of initializeVisualization