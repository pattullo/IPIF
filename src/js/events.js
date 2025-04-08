// Import the download function from main.js
import { triggerJsonDownload } from './main.js';

// Store references set by setup functions
let cyInstance = null;
let updateMasterDataCallback = null;
let selectedNodeDataForEdit = null; // Stores data only while edit modal is potentially active

// --- Helper function to safely get element references ---
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) { console.error(`Element with ID '${id}' not found.`); }
    return element;
}

// --- Get references to modal elements ---
// Detail Modal
const detailModal = getElement('detailModal');
const closeDetailModalButton = getElement('closeDetailModal');
const editNodeButton = getElement('editNodeButton'); // Still referenced even if hidden
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
    if (!editModal || !editForm) { console.error("Edit modal elements missing."); return; }

    selectedNodeDataForEdit = nodeData; // Store for saving

    // Populate form (ensure elements exist before setting value)
    if(editIdInput) editIdInput.value = nodeData.id || '';
    if(editNameInput) editNameInput.value = nodeData.name || '';
    if(editTypeInput) editTypeInput.value = nodeData.type || 'Course';
    if(editDomainInput) editDomainInput.value = nodeData.domain || '';
    if(editStatusInput) editStatusInput.value = nodeData.status || 'Planned';
    if(editCompletionDateInput) editCompletionDateInput.value = nodeData.completion_date || '';
    if(editExpiryDateInput) editExpiryDateInput.value = nodeData.expiry_date || '';
    if(editProviderInput) editProviderInput.value = nodeData.provider || '';
    if(editProgramsInput) editProgramsInput.value = Array.isArray(nodeData.programs) ? nodeData.programs.join(', ') : (nodeData.programs || '');
    if(editTagsInput) editTagsInput.value = Array.isArray(nodeData.tags) ? nodeData.tags.join(', ') : (nodeData.tags || '');
    if(editNotesInput) editNotesInput.value = nodeData.notes || '';

    editModal.style.display = 'block';
}

// --- Function to hide all modals ---
function hideAllModals() {
    if (detailModal) detailModal.style.display = 'none';
    if (editModal) editModal.style.display = 'none';
    selectedNodeDataForEdit = null; // Clear pending edit data
}

// --- Setup for Cytoscape/Modal Events ---
export function setupModalEventListeners(cy, updateMasterDataFn) {
    if (!cy) { console.error("Cytoscape instance needed for modal events."); return; }
    if (typeof updateMasterDataFn !== 'function') { console.error("updateMasterData function needed for modal events."); return; }

    cyInstance = cy;
    updateMasterDataCallback = updateMasterDataFn;
    console.log("Setting up modal event listeners.");

    // Node Click/Tap Listener
    cyInstance.removeListener('tap', 'node').on('tap', 'node', function(evt){ // Use removeListener first
        const node = evt.target;
        // Ignore clicks on parent nodes for detail view
        if (node.isParent()) return;

        const nodeData = node.data();
        console.log("Node tapped:", nodeData.id);

        if (!detailModal) return;

        // Populate detail modal (check element existence)
        if(detailName) detailName.textContent = nodeData.name || 'N/A';
        if(detailId) detailId.textContent = nodeData.id || 'N/A';
        // ... (populate all other detail spans safely) ...
        if(detailType) detailType.textContent = nodeData.type || 'N/A';
        if(detailDomain) detailDomain.textContent = nodeData.domain || 'N/A';
        if(detailStatus) detailStatus.textContent = nodeData.status || 'N/A';
        if(detailCompletionDate) detailCompletionDate.textContent = nodeData.completion_date || 'N/A';
        if(detailExpiryDate) detailExpiryDate.textContent = nodeData.expiry_date || 'N/A';
        if(detailProvider) detailProvider.textContent = nodeData.provider || 'N/A';
        if(detailPrograms) detailPrograms.textContent = Array.isArray(nodeData.programs) ? nodeData.programs.join(', ') : (nodeData.programs || 'N/A');
        if(detailTags) detailTags.textContent = Array.isArray(nodeData.tags) ? nodeData.tags.join(', ') : (nodeData.tags || 'N/A');
        if(detailNotes) detailNotes.textContent = nodeData.notes || '';


        detailModal.style.display = 'block';
    });

    // Detail Modal: Close Button
    if (closeDetailModalButton) { closeDetailModalButton.onclick = hideAllModals; }
    else { console.warn("Detail modal close button not found."); }

    // Detail Modal: Edit Button (listener still attached even if hidden)
    if (editNodeButton) {
        editNodeButton.onclick = function() {
            const nodeId = detailId?.textContent;
            if (!nodeId || nodeId === 'N/A' || !cyInstance) { /* ... error ... */ return; }
            try {
                const node = cyInstance.$id(nodeId);
                if (node.length > 0 && !node.isParent()) { // Ensure it's not a parent
                    const nodeData = node.data();
                    hideAllModals();
                    showEditModal(nodeData);
                } else { /* ... error handling ... */ hideAllModals(); }
            } catch(error) { /* ... error handling ... */ hideAllModals(); }
        }
    } else { console.warn("Detail modal edit button not found."); }

    // Edit Modal: Close Button
    if (closeEditModalButton) { closeEditModalButton.onclick = hideAllModals; }
    else { console.warn("Edit modal close button not found."); }

    // Edit Modal: Cancel Button
    if (cancelEditButton) { cancelEditButton.onclick = hideAllModals; }
    else { console.warn("Edit modal cancel button not found."); }

    // Edit Modal: Form Submission (Save Changes)
    if (editForm) {
        editForm.onsubmit = function(event) {
            event.preventDefault();

            if (!selectedNodeDataForEdit || !selectedNodeDataForEdit.id || !cyInstance) { /* error */ hideAllModals(); return; }
            const nodeId = selectedNodeDataForEdit.id;

            const nameValue = editNameInput.value.trim();
            if (!nameValue) { alert("Node name cannot be empty."); return; }

            // Prepare updated data
            const programsArray = editProgramsInput.value ? editProgramsInput.value.split(',').map(s => s.trim()).filter(Boolean) : [];
            const tagsArray = editTagsInput.value ? editTagsInput.value.split(',').map(s => s.trim()).filter(Boolean) : [];
            const updatedData = {
                // ... (gather all form fields into updatedData object as before) ...
                id: nodeId, name: nameValue, type: editTypeInput.value, domain: editDomainInput.value.trim(),
                status: editStatusInput.value, completion_date: editCompletionDateInput.value || null,
                expiry_date: editExpiryDateInput.value || null, provider: editProviderInput.value.trim(),
                programs: programsArray, tags: tagsArray, notes: editNotesInput.value.trim(),
                 // Preserve relationships (CRITICAL)
                 prerequisites: cyInstance.$id(nodeId).data('prerequisites') || [],
                 maintenance_contribution_for: cyInstance.$id(nodeId).data('maintenance_contribution_for') || []
            };

            console.log(`Attempting to update node '${nodeId}' with data:`, updatedData);

            // Update Cytoscape Node (Visual)
            let updateSuccessful = false;
            try {
                const node = cyInstance.$id(nodeId);
                if(node.length > 0) {
                    node.data(updatedData);
                    console.log(`Node '${nodeId}' updated visually.`);
                    node.addClass('updated').delay(1200).removeClass('updated');
                    updateSuccessful = true;
                } else { /* error handling */ }
            } catch (error) { /* error handling */ }

            // Update Master Data Array & Trigger Download
            if(updateSuccessful) {
                if(updateMasterDataCallback) { updateMasterDataCallback(updatedData); }
                else { console.error("updateMasterDataCallback missing!"); }
                triggerJsonDownload(); // Trigger download (imported from main.js)
            }

            hideAllModals();
        };
    } else { console.error("Edit form element not found."); }

    // Window Click Listener (remains same)
     window.addEventListener('click', function(event) {
         if (detailModal && event.target == detailModal) { hideAllModals(); }
         if (editModal && event.target == editModal) { hideAllModals(); }
     });

    console.log("Modal event listeners setup complete.");
} // End setupModalEventListeners


// --- Setup for UI Elements (like Legend Toggle) ---
export function setupUIEventListeners() {
    console.log("Setting up UI event listeners...");
    const legendToggleButton = getElement('legend-toggle');
    const legendContent = getElement('legendContent');

    if (legendToggleButton && legendContent) {
        legendToggleButton.addEventListener('click', () => {
            // Check computed style if needed, but checking display none/block is usually enough
            const isHidden = legendContent.style.display === 'none' || legendContent.style.display === '';
            legendContent.style.display = isHidden ? 'block' : 'none';
            console.log(`Legend toggled ${isHidden ? 'visible' : 'hidden'}`);
        });
         console.log("Legend toggle event listener added.");
    } else {
        console.warn("Legend UI elements not found. Toggle not initialized.");
    }
    // Add other general UI listeners here
}