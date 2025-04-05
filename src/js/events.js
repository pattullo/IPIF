// This file sets up event listeners related to the Cytoscape graph and modals

// Import the download function from main.js
import { triggerJsonDownload } from './main.js';

// Store reference to cy - set by setupModalEventListeners
let cyInstance = null;
// Store the callback function provided by main.js to update the master data array
let updateMasterDataCallback = null;
// Store data for the node currently being edited (set when edit modal opens)
let selectedNodeDataForEdit = null;


// --- Helper function to safely get element references ---
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        // Log error but don't necessarily stop execution, handle missing elements gracefully later
        console.error(`Element with ID '${id}' not found.`);
    }
    return element;
}


/// --- Get references to modal elements ---
// Detail Modal
const detailModal = getElement('detailModal');
const closeDetailModalButton = getElement('closeDetailModal');
const editNodeButton = getElement('editNodeButton');
const detailName = getElement('detailName');
const detailId = getElement('detailId');
const detailType = getElement('detailType');
const detailDomain = getElement('detailDomain');
const detailStatus = getElement('detailStatus');
const detailCompletionDate = getElement('detailCompletionDate');
const detailExpiryDate = getElement('detailExpiryDate');
const detailProvider = getElement('detailProvider');
const detailPrograms = getElement('detailPrograms');
const detailTags = getElement('detailTags');
const detailNotes = getElement('detailNotes');

// Edit Modal
const editModal = getElement('editModal');
const editForm = getElement('editForm');
const closeEditModalButton = getElement('closeEditModal');
const cancelEditButton = getElement('cancelEdit');
const editIdInput = getElement('editId');
const editNameInput = getElement('editName');
const editTypeInput = getElement('editType');
const editDomainInput = getElement('editDomain');
const editStatusInput = getElement('editStatus');
const editCompletionDateInput = getElement('editCompletionDate');
const editExpiryDateInput = getElement('editExpiryDate');
const editProviderInput = getElement('editProvider');
const editProgramsInput = getElement('editPrograms');
const editTagsInput = getElement('editTags');
const editNotesInput = getElement('editNotes');

// --- Function to show and populate the edit modal ---
function showEditModal(nodeData) {
    // Ensure modal elements exist before proceeding
    if (!editModal || !editForm || !editIdInput || !editNameInput || !editTypeInput ||
        !editDomainInput || !editStatusInput || !editCompletionDateInput ||
        !editExpiryDateInput || !editProviderInput || !editProgramsInput ||
        !editTagsInput || !editNotesInput) {
        console.error("Cannot show edit modal - one or more form elements are missing.");
        return;
    }

    selectedNodeDataForEdit = nodeData; // Store data for saving

    // Populate the form fields
    editIdInput.value = nodeData.id || '';
    editNameInput.value = nodeData.name || '';
    editTypeInput.value = nodeData.type || 'Course'; // Default type
    editDomainInput.value = nodeData.domain || '';
    editStatusInput.value = nodeData.status || 'Planned'; // Default status
    editCompletionDateInput.value = nodeData.completion_date || ''; // Works directly with date input type
    editExpiryDateInput.value = nodeData.expiry_date || ''; // Works directly with date input type
    editProviderInput.value = nodeData.provider || '';
    // Join array fields with comma for text input
    editProgramsInput.value = Array.isArray(nodeData.programs) ? nodeData.programs.join(', ') : (nodeData.programs || '');
    editTagsInput.value = Array.isArray(nodeData.tags) ? nodeData.tags.join(', ') : (nodeData.tags || '');
    editNotesInput.value = nodeData.notes || '';

    editModal.style.display = 'block'; // Show the modal
}

// --- Function to hide all modals ---
function hideAllModals() {
    if (detailModal) detailModal.style.display = 'none';
    if (editModal) editModal.style.display = 'none';
    selectedNodeDataForEdit = null; // Clear any pending edit data when modals close
}

// --- Main function to set up listeners - accepts the cy instance and update callback ---
export function setupModalEventListeners(cy, updateMasterDataFn) {
    // Validate inputs
    if (!cy) {
        console.error("Cytoscape instance not provided to setupModalEventListeners.");
        return;
    }
    if (typeof updateMasterDataFn !== 'function') {
         console.error("updateMasterData function not provided to setupModalEventListeners.");
         return;
     }

    // Store references
    cyInstance = cy;
    updateMasterDataCallback = updateMasterDataFn;
    console.log("Setting up modal event listeners with update callback.");

    // --- Node Click/Tap Listener ---
    cyInstance.off('tap', 'node').on('tap', 'node', function(evt){ // Use .off first to prevent duplicates if called multiple times
        const node = evt.target;
        const nodeData = node.data();
        console.log("Node tapped:", nodeData.id);

        // Ensure detail modal elements exist
        if (!detailModal || !detailName || !detailId || !detailType || !detailDomain ||
            !detailStatus || !detailCompletionDate || !detailExpiryDate ||
            !detailProvider || !detailPrograms || !detailTags || !detailNotes) {
            console.error("Cannot populate detail modal - one or more display elements missing.");
            return;
        }

        // Populate the detail modal fields
        detailName.textContent = nodeData.name || 'N/A';
        detailId.textContent = nodeData.id || 'N/A';
        detailType.textContent = nodeData.type || 'N/A';
        detailDomain.textContent = nodeData.domain || 'N/A';
        detailStatus.textContent = nodeData.status || 'N/A';
        detailCompletionDate.textContent = nodeData.completion_date || 'N/A';
        detailExpiryDate.textContent = nodeData.expiry_date || 'N/A';
        detailProvider.textContent = nodeData.provider || 'N/A';
        detailPrograms.textContent = Array.isArray(nodeData.programs) ? nodeData.programs.join(', ') : (nodeData.programs || 'N/A');
        detailTags.textContent = Array.isArray(nodeData.tags) ? nodeData.tags.join(', ') : (nodeData.tags || 'N/A');
        detailNotes.textContent = nodeData.notes || '';

        detailModal.style.display = 'block'; // Show the modal
    });

    // --- Detail Modal: Close Button ---
    if (closeDetailModalButton) {
        closeDetailModalButton.onclick = hideAllModals;
    } else { console.warn("Detail modal close button not found."); }

    // --- Detail Modal: Edit Button ---
    if (editNodeButton) {
        editNodeButton.onclick = function() {
            const nodeId = detailId?.textContent; // Get ID from the currently displayed detail modal
            if (!nodeId || nodeId === 'N/A' || !cyInstance) {
                 console.error("Could not get node ID from detail modal or cyInstance missing for edit action.");
                 return;
            }
            try {
                const node = cyInstance.$id(nodeId); // Find the node in Cytoscape
                if (node.length > 0) { // Check if the node element was found
                    const nodeData = node.data(); // Get its current data
                    hideAllModals(); // Hide detail modal before showing edit
                    showEditModal(nodeData); // Show edit modal, passing current data
                } else {
                    console.error(`Node with ID '${nodeId}' not found in graph for edit.`);
                    hideAllModals(); // Hide detail modal even if node not found
                }
            } catch(error) {
                 console.error(`Error finding node '${nodeId}' to edit:`, error);
                 hideAllModals(); // Ensure modals close on error
            }
        }
    } else { console.warn("Detail modal edit button not found."); }

    // --- Edit Modal: Close Button ---
    if (closeEditModalButton) {
        closeEditModalButton.onclick = hideAllModals;
    } else { console.warn("Edit modal close button not found."); }

    // --- Edit Modal: Cancel Button ---
    if (cancelEditButton) {
        cancelEditButton.onclick = hideAllModals;
    } else { console.warn("Edit modal cancel button not found."); }

    // --- Edit Modal: Form Submission (Save Changes) ---
    if (editForm) {
        editForm.onsubmit = function(event) {
            event.preventDefault(); // Prevent default HTML form submission

            // Ensure we have the data of the node being edited and the cy instance
            if (!selectedNodeDataForEdit || !selectedNodeDataForEdit.id || !cyInstance) {
                console.error("No node data stored for saving or cyInstance missing.");
                alert("Error: Cannot save changes. No node data loaded.");
                hideAllModals();
                return;
            }
            const nodeId = selectedNodeDataForEdit.id;

            // --- Basic Client-Side Validation ---
            const nameValue = editNameInput.value.trim();
            if (!nameValue) {
                alert("Node name cannot be empty.");
                editNameInput.focus(); // Focus the name field
                return; // Stop the save process
            }
            // Add more validation as needed (e.g., date formats, numeric fields)

            // --- Prepare Updated Data Object ---
            // Split comma-separated strings back into arrays, trim whitespace, filter empty elements
            const programsArray = editProgramsInput.value ? editProgramsInput.value.split(',').map(s => s.trim()).filter(Boolean) : [];
            const tagsArray = editTagsInput.value ? editTagsInput.value.split(',').map(s => s.trim()).filter(Boolean) : [];

            const updatedData = {
                id: nodeId, // Use the original ID
                name: nameValue,
                type: editTypeInput.value,
                domain: editDomainInput.value.trim(),
                status: editStatusInput.value,
                completion_date: editCompletionDateInput.value || null, // Ensure empty dates become null
                expiry_date: editExpiryDateInput.value || null, // Ensure empty dates become null
                provider: editProviderInput.value.trim(),
                programs: programsArray, // Assign processed array
                tags: tagsArray,         // Assign processed array
                notes: editNotesInput.value.trim(),
                // --- Preserve relationships from the *original* data before edit ---
                prerequisites: selectedNodeDataForEdit.prerequisites || [],
                maintenance_contribution_for: selectedNodeDataForEdit.maintenance_contribution_for || []
            };

            console.log(`Attempting to update node '${nodeId}' with data:`, updatedData);

            // --- Update Cytoscape Node (Visual Update) ---
            let updateSuccessful = false;
            try {
                const node = cyInstance.$id(nodeId); // Find the node again
                if(node.length > 0) {
                    node.data(updatedData); // Update the data in Cytoscape's memory
                    console.log(`Node '${nodeId}' data updated visually in Cytoscape.`);
                    // Provide visual feedback
                    node.addClass('updated');
                     // Use a promise with setTimeout for reliable class removal
                     new Promise(resolve => setTimeout(resolve, 1200)).then(() => {
                         node.removeClass('updated');
                     });
                    updateSuccessful = true; // Mark update as successful
                } else {
                    console.error(`Node '${nodeId}' not found in graph during save attempt.`);
                    alert(`Error: Node '${nodeId}' not found. Cannot save changes.`);
                }
            } catch (error) {
                 console.error(`Error updating node '${nodeId}' visual data:`, error);
                 alert(`Error applying changes visually: ${error.message}`);
            }

            // --- Update Master Data Array & Trigger Download (If visual update succeeded) ---
            if(updateSuccessful) {
                if(updateMasterDataCallback) {
                    updateMasterDataCallback(updatedData); // Call the function passed from main.js
                } else {
                     console.error("updateMasterDataCallback is not defined! Cannot update master array.");
                 }
                // Trigger the JSON download function (imported from main.js)
                triggerJsonDownload();
            }

            hideAllModals(); // Hide the edit modal regardless of backend save success
        };
    } else {
        console.error("Edit form element (editForm) not found. Cannot setup save handler.");
    }

    // --- Handle clicking outside the modals to close ---
    window.addEventListener('click', function(event) {
        if (detailModal && event.target == detailModal) {
            hideAllModals();
        }
        if (editModal && event.target == editModal) {
             hideAllModals();
        }
    });

    console.log("Modal event listeners setup complete.");
} // End of setupModalEventListeners