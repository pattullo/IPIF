// Import initialization functions and helpers
import { initializeVisualization, getLearningItemsFromElements } from './visualization.js';
// Import BOTH setup functions from events.js
import { setupModalEventListeners, setupUIEventListeners } from './events.js';
import { setupFilters } from './filters.js';

// --- Global variable to hold the master data (array of learning_items) ---
let masterLearningData = [];

// --- Function to update the master data array ---
// Passed as callback to events.js
export function updateMasterDataItem(updatedItem) {
    if (!updatedItem || typeof updatedItem.id === 'undefined') {
        console.error("updateMasterDataItem received invalid item:", updatedItem);
        return;
    }
    const index = masterLearningData.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
        masterLearningData[index] = updatedItem; // Replace item
        console.log(`Master data array updated for item ID: ${updatedItem.id}`);
    } else {
        console.warn(`Item ID ${updatedItem.id} not found in master data for update. Adding as new item.`);
        masterLearningData.push(updatedItem); // Add if not found (for future 'Add' feature)
    }
}

// --- Function to trigger JSON download ---
// Exported so it can be imported by events.js
export function triggerJsonDownload() {
    if (!masterLearningData || masterLearningData.length === 0) {
        console.error("No master data available to download.");
        alert("No data to download.");
        return;
    }
    try {
        const dataToSave = { learning_items: masterLearningData };
        const jsonString = JSON.stringify(dataToSave, null, 2); // Pretty print
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        const now = new Date();
        const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        a.download = `learning_data_${timestamp}.json`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log("JSON download triggered.");
        // Optional: Non-alert notification
        // showTemporaryMessage("Updated data download started...");
    } catch (error) {
         console.error("Error triggering JSON download:", error);
         alert("Error preparing data for download.");
    }
}


// --- Main execution starts after DOM is loaded ---
document.addEventListener('DOMContentLoaded', async function() {
    console.log("DOM Loaded. Initializing IPIF Application...");

    try {
        const initResult = await initializeVisualization('#cy');

        if (initResult && initResult.cy) {
            const cy = initResult.cy;

            if (cy.elements() && typeof cy.elements().nodes === 'function') {
                 masterLearningData = getLearningItemsFromElements(cy.elements());
                 console.log("Initial data stored in masterLearningData.", masterLearningData.length, "items");
            } else {
                 console.error("Cytoscape elements are invalid after initialization.");
                 masterLearningData = [];
            }

            // Setup CYTOSCAPE related event listeners (Modals)
            setupModalEventListeners(cy, updateMasterDataItem);

            // Setup Filters (using masterLearningData)
            if (masterLearningData.length > 0) {
                setupFilters(cy, masterLearningData); // Pass cy and the actual data array
            } else {
                 console.warn("No data available to set up filters.");
            }

            // Setup other UI event listeners (Legend Toggle)
            setupUIEventListeners();

            console.log("IPIF Application Initialized Successfully.");

        } else { /* ... error handling ... */ }
    } catch (error) { /* ... error handling ... */ }
});