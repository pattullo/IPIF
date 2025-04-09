// Handles Cytoscape initialization, styling, and layout

// Import Cytoscape library (if using npm/modules)
// import cytoscape from 'cytoscape';
// Import and register layout extensions like dagre (if using npm/modules)
// import dagre from 'cytoscape-dagre';
// cytoscape.use(dagre); // Register the layout algorithm

// Import dependencies
import { loadAndProcessData } from './data_loader.js'; // Handles fetching and transforming data
import { ipifStyles } from './cy_styles.js';          // Imports the Cytoscape style array
import { ipifLayout } from './cy_layout_config.js'; // Imports the Cytoscape layout config object

// Helper function to extract original learning items from Cytoscape elements
export function getLearningItemsFromElements(elements) {
    if (!elements || typeof elements.nodes !== 'function') {
        console.warn("getLearningItemsFromElements: Invalid elements object received.");
        return [];
    }
    // Filter out edges AND parent nodes, map child nodes back to their original data structure
    return elements.nodes().filter(node => !node.data('isParent')).map(node => node.data());
}


// Main function to initialize Cytoscape
export async function initializeVisualization(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Container element '${containerSelector}' not found.`);
        return null;
    }

    // Fetch and process data using the dedicated loader
    const { elements: graphElements, uniqueDomains } = await loadAndProcessData(); // Assume fetchData path is correct inside data_loader

    // Validate processed data
    if (!Array.isArray(graphElements)) {
        console.error("Failed to get valid graph elements array from data loader.");
        if (container) container.innerHTML = 'Error: Invalid data structure loaded.';
        return null;
    }

    console.log(`Initializing Cytoscape with ${graphElements.length} elements...`);

    try {
        // Initialize Cytoscape instance
        const cy = cytoscape({
            container: container,
            elements: graphElements,
            style: ipifStyles, // Use imported styles
            layout: ipifLayout, // Use imported layout configuration
            // Define interaction options directly?
            // wheelSensitivity: 0.1, // Example: Adjust zoom sensitivity
            // minZoom: 0.1,
            // maxZoom: 2.0,
        });

        // --- Basic Interaction Listeners ---
        cy.on('mouseover', 'node[!isParent]', (event) => event.target.addClass('hover'));
        cy.on('mouseout', 'node[!isParent]', (event) => event.target.removeClass('hover'));

        console.log("Cytoscape core initialization complete.");

        // --- Adjust Initial View using cy.ready() ---
        cy.ready(function () {
            console.log("cy.ready() called. Adjusting initial view...");
            // Using setTimeout to ensure layout calculations are likely finished
            setTimeout(() => {
                console.log("Adjusting viewport inside setTimeout after cy.ready...");

                // Use fine-tuned padding/offset
                const padding = { top: 30, right: 30, bottom: 30, left: 15 };
                const extraHorizontalOffset = 10;
                console.log(`Using Settings: Padding=${JSON.stringify(padding)}, ExtraOffset=${extraHorizontalOffset}`);

                const bb = cy.elements().boundingBox(); // Get model bounds
                console.log("Model Bounding Box (bb):", JSON.stringify(bb));

                if (bb.w === 0 || bb.h === 0) { /* ... error handling ... */ cy.center(); return; }

                // --- Set Fixed Target Zoom ---
                const targetZoom = 0.8;
                console.log(`Using Fixed Zoom (targetZoom): ${targetZoom.toFixed(3)}`);

                // Calculate pan based on model coordinates and target zoom
                const viewportHeight = cy.height();

                // Adjust Pan Calculation ---
                // Align LEFT edge with padding + offset
                const targetPanX = padding.left + extraHorizontalOffset - (bb.x1 * targetZoom);
                // Align TOP edge near top padding (instead of centering vertically)
                const targetPanY = padding.top - (bb.y1 * targetZoom);
                console.log(`Calculated Pan: targetPanX=${targetPanX.toFixed(2)}, targetPanY=${targetPanY.toFixed(2)}`);

                // Apply zoom and pan together
                cy.viewport({
                    zoom: targetZoom,
                    pan: { x: targetPanX, y: targetPanY }
                });
                console.log("Viewport set.");

                console.log(`Final Viewport: Zoom=${cy.zoom().toFixed(3)}, Pan=(${cy.pan().x.toFixed(0)}, ${cy.pan().y.toFixed(0)})`);

            }, 100); // 100ms delay

        }); // End cy.ready()

        // Initial resize call
        cy.resize();


        // Temporary zoom logger to catch ideal zoom level, rounded to 3 decimals
        //cy.on('zoom', function() {
        //    console.log('Current zoom level:', cy.zoom().toFixed(3));
        //});

        // Return object containing the cy instance
        return { cy: cy };

    } catch (error) {
        console.error("Error initializing Cytoscape:", error);
        if (container) container.innerHTML = `Error initializing Cytoscape: ${error.message}`;
        return null;
    }
} // End of initializeVisualization