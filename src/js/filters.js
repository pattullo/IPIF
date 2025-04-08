// Stores the Cytoscape instance and master data list
let cyInstance = null;
let masterLearningData = [];

// References to filter dropdown elements - Verify these IDs match your HTML!
let domainFilterSelect = null;
let programFilterSelect = null;
let providerFilterSelect = null;
let resetFiltersButton = null;

// --- Helper Functions to Extract Unique Filter Options ---
function getUniqueValues(items, property) {
    if (!Array.isArray(items)) return [];
    return [...new Set(items.map(item => item ? item[property] : undefined))] // Handle potential undefined items gracefully
        .filter(value => value !== null && typeof value !== 'undefined' && value !== '')
        .sort();
}

function getUniquePrograms(items) {
    if (!Array.isArray(items)) return [];
    const allPrograms = items.flatMap(item => item?.programs || []); // Use optional chaining
    return [...new Set(allPrograms)]
        .filter(value => value !== null && typeof value !== 'undefined' && value !== '')
        .sort();
}

// --- Function to Populate Dropdowns ---

function populateDropdown(selectElement, optionsArray, defaultLabel = "All") {
    if (!selectElement) {
        console.warn(`Dropdown element not found for populating (${defaultLabel})`);
        return;
    }
    selectElement.innerHTML = `<option value="">${defaultLabel}</option>`; // Use empty value for "All"

    optionsArray.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue;
        selectElement.appendChild(option);
    });
}

// --- Function to Apply Filters to the Graph ---

function applyFilters() {
    if (!cyInstance) {
        console.error("Cannot apply filters: cyInstance is not available.");
        return;
    }

    // Get current filter values (empty string means "All")
    const selectedDomain = domainFilterSelect?.value || "";
    const selectedProgram = programFilterSelect?.value || "";
    const selectedProvider = providerFilterSelect?.value || "";
    // const selectedStatus = statusFilterSelect?.value || "";

    console.log(`Applying filters - Domain: '${selectedDomain}', Program: '${selectedProgram}', Provider: '${selectedProvider}'`);

    // Use batch operations for performance
    cyInstance.batch(() => {
        // Filter CHILD nodes based on selections
        const visibleChildNodes = cyInstance.nodes().filter(node => {
            // Important: Skip nodes that are already filtered out by other means if necessary
            // if (node.removed()) return false; // Check if node was removed, skip if so
            if (node.isParent()) return false; // Ignore parent nodes in this filter

            const data = node.data();
            if (!data) return false; // Skip if node has no data

            let domainMatch = selectedDomain === "" || data.domain === selectedDomain;
            let providerMatch = selectedProvider === "" || data.provider === selectedProvider;
            // let statusMatch = selectedStatus === "" || data.status === selectedStatus;

            // Program match: check if the programs array contains the selected program
            let programMatch = selectedProgram === "" || (Array.isArray(data.programs) && data.programs.includes(selectedProgram));

            return domainMatch && programMatch && providerMatch /* && statusMatch */;
        });

        // Determine which parent nodes need to be visible
        const parentsOfVisibleChildren = visibleChildNodes.parents();

        // Combine visible children and their necessary parents
        const elementsToShow = visibleChildNodes.union(parentsOfVisibleChildren);

        // Hide ALL elements first (nodes and edges)
        cyInstance.elements().style('display', 'none');

        // Show the filtered nodes, their parents, and the edges connecting them
        // Important: Ensure compound parent visibility settings allow children to show through
        elementsToShow.style('display', 'element');
        // Show edges that connect nodes WITHIN the visible set
        elementsToShow.edgesWith(elementsToShow).style('display', 'element');

    }); // End batch

    console.log(`Filter applied. Visible child nodes: ${visibleChildNodes.length}`);

    // Optional: Re-run layout on visible elements. Use with caution.
    /*
    const visibleEles = cyInstance.elements(':visible');
    if (visibleEles.length > 0 && visibleEles.length < cyInstance.elements().length) { // Avoid re-layout if everything is visible
        console.log("Running layout on visible elements...");
        cyInstance.layout({
            name: 'dagre', rankDir: 'LR', fit: false, eles: visibleEles
        }).run();
    }
    */
}


// --- Exported Setup Function (Called from main.js) ---
export function setupFilters(cy, learningDataArray) {
    if (!cy || !Array.isArray(learningDataArray)) {
        console.error("setupFilters requires a valid Cytoscape instance and data array.");
        return;
    }
    cyInstance = cy;
    masterLearningData = learningDataArray; // Store data

    console.log("Setting up filters...");

    // Get references to DOM elements - *** VERIFY THESE IDS MATCH YOUR HTML ***
    domainFilterSelect = document.getElementById('domain-filter');
    programFilterSelect = document.getElementById('program-filter');
    providerFilterSelect = document.getElementById('provider-filter');

    // --- Get reference to reset button ---
    resetFiltersButton = document.getElementById('reset-filters-btn');

    // Populate dropdowns initially
    populateDropdown(domainFilterSelect, getUniqueValues(masterLearningData, 'domain'), "All Domains");
    populateDropdown(programFilterSelect, getUniquePrograms(masterLearningData), "All Programs");
    populateDropdown(providerFilterSelect, getUniqueValues(masterLearningData, 'provider'), "All Providers");

    // Add event listeners to trigger filtering
    const filterElements = [domainFilterSelect, programFilterSelect, providerFilterSelect /*, statusFilterSelect*/];
    filterElements.forEach(selectElement => {
        if (selectElement) {
            // Remove existing listener first to prevent duplicates if called again
            selectElement.removeEventListener('change', applyFilters);
            selectElement.addEventListener('change', applyFilters);
        } else {
            console.warn("A filter select element was not found during listener setup.");
        }
    });

// --- Add event listener for reset button ---
    if (resetFiltersButton) {
        resetFiltersButton.addEventListener('click', () => {
            console.log("Reset filters button clicked.");
            // Reset all select dropdowns to their first option ("All")
            [domainFilterSelect, programFilterSelect, providerFilterSelect /*, statusFilterSelect*/]
                .forEach(select => {
                    if (select) select.value = ""; // Set value to empty string for "All" option
                });
            // Re-apply filters (which will now show everything)
            applyFilters();
        });
         console.log("Reset filters listener added.");
    } else {
        console.warn("Reset filters button not found.");
    }

    console.log("Filter setup complete.");
}