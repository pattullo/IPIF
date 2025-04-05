// Import initialization functions and helpers
import { initializeVisualization, getLearningItemsFromElements } from './visualization.js';
import { setupModalEventListeners } from './events.js'; // Corrected import
// import { setupFilters } from './filters.js';

// --- Global variable to hold the master data (array of learning_items) ---
// Defined outside DOMContentLoaded so it persists within the module scope
let masterLearningData = [];

// --- Function to update the master data array ---
// DEFINED *BEFORE* it's used in DOMContentLoaded listener
// This function is passed to events.js
export function updateMasterDataItem(updatedItem) {
    if (!updatedItem || typeof updatedItem.id === 'undefined') {
        console.error("updateMasterDataItem received invalid item:", updatedItem);
        return;
    }
    const index = masterLearningData.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
        // Replace the old item with the updated one
        masterLearningData[index] = updatedItem;
        console.log(`Master data array updated for item ID: ${updatedItem.id}`);
    } else {
        // This case handles adding a NEW item if implemented later
        console.warn(`Item ID ${updatedItem.id} not found in master data for update. Adding as new item.`);
        masterLearningData.push(updatedItem); // Add if not found (useful for "Add Node" feature)
    }
    // console.log("Current Master Data Length:", masterLearningData.length);
}

// --- Function to trigger JSON download ---
// DEFINED *BEFORE* potential use (though currently only called from events.js)
// Exported so it can be imported by events.js
export function triggerJsonDownload() {
    if (!masterLearningData || masterLearningData.length === 0) {
        console.error("No master data available to download.");
        alert("No data to download.");
        return;
    }

    // Prepare the data in the standard { learning_items: [...] } format
    const dataToSave = { learning_items: masterLearningData };
    const jsonString = JSON.stringify(dataToSave, null, 2); // Pretty print
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`; // Added seconds
    a.download = `learning_data_${timestamp}.json`; // Unique filename

    document.body.appendChild(a);
    a.click(); // Trigger download
    document.body.removeChild(a); // Clean up link
    URL.revokeObjectURL(url); // Release object URL resource
    console.log("JSON download triggered.");
    // Consider a less intrusive notification than alert:
    // e.g., display a temporary message on the page
    // alert("Updated JSON file download initiated. Save it to replace your old data file if desired.");
}


// --- Main execution starts after DOM is loaded ---
document.addEventListener('DOMContentLoaded', async function() {
    console.log("DOM Loaded. Initializing IPIF Application...");

    try {
        // InitializeVisualization now returns an object { cy }
        const initResult = await initializeVisualization('#cy');

        if (initResult && initResult.cy) {
            const cy = initResult.cy;
            // Store the initial data using the helper function
            // Ensure cy.elements() returns something valid before calling helper
            if (cy.elements() && typeof cy.elements().nodes === 'function') {
                 masterLearningData = getLearningItemsFromElements(cy.elements());
                 console.log("Cytoscape instance received. Initial data stored.", masterLearningData.length, "items");
            } else {
                 console.error("Cytoscape elements are invalid after initialization.");
                 masterLearningData = []; // Ensure it's an empty array
            }


            // Setup event listeners, passing the cy instance and the update function
            // Ensure the function NAME here matches the one defined above
            setupModalEventListeners(cy, updateMasterDataItem); // Pass the actual function reference

            // setupFilters(cy); // Uncomment when filters are being worked on

            console.log("IPIF Application Initialized Successfully.");

        } else {
            console.error("Cytoscape initialization failed. Cannot proceed.");
            const container = document.querySelector('#cy');
            if(container) container.innerHTML = 'Error: Failed to load visualization.';
        }
    } catch (error) {
        console.error("Error during application initialization:", error);
         const container = document.querySelector('#cy');
         if(container) container.innerHTML = `Error: Application failed to initialize. ${error.message}`;
    }
});