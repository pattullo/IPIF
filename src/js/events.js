// Import the download function from main.js
import { triggerJsonDownload } from './main.js';

// --- Module Scope Variables ---
let cyInstance = null;
let updateMasterDataCallback = null;
let selectedNodeDataForEdit = null; // Stores data only while edit modal is potentially active

// --- Helper function to safely get element references ---
function getElement(id) {
    const element = document.getElementById(id);
    // Warn but don't error, allows graceful failure if an element is missing
    if (!element) { console.warn(`Element with ID '${id}' not found.`); }
    return element;
}

// --- DOM Element References --- (Get them once)
// Detail Modal Elements
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
const notesSection = getElement('notesSection'); // Wrapper div for notes label AND pre tag
const detailNotesPre = getElement('detailNotes'); // The <pre> tag itself

// Edit Modal Elements
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

// --- Modal Logic Functions ---

function showEditModal(nodeData) {
    if (!editModal || !editForm) { console.error("Edit modal elements missing."); return; }
    selectedNodeDataForEdit = nodeData;
    // Populate form safely
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
    editModal.style.display = 'flex'; // Use flex to enable centering
}

function hideAllModals() {
    if (detailModal) detailModal.style.display = 'none';
    if (editModal) editModal.style.display = 'none';
    selectedNodeDataForEdit = null;
}

// --- Setup for Cytoscape/Modal Events ---
// ***** ENSURE THIS FUNCTION WRAPPER AND EXPORT ARE PRESENT *****
export function setupModalEventListeners(cy, updateMasterDataFn) {
    if (!cy) { console.error("Cytoscape instance needed for modal events."); return; }
    if (typeof updateMasterDataFn !== 'function') { console.error("updateMasterData function needed for modal events."); return; }

    cyInstance = cy;
    updateMasterDataCallback = updateMasterDataFn;
    console.log("Setting up modal event listeners.");

    // Node Click/Tap Listener
    cyInstance.removeListener('tap', 'node').on('tap', 'node', function(evt){
        const node = evt.target;
        if (node.isParent()) return; // Ignore clicks on parent nodes

        const nodeData = node.data();
        console.log("Node tapped:", nodeData.id);
        if (!detailModal) return;

        // Populate detail modal fields safely, use '' for empty
        if(detailName) detailName.textContent = nodeData.name || ''; 
        if(detailId) detailId.textContent = nodeData.id || ''; 
        if(detailType) detailType.textContent = nodeData.type || ''; 
        if(detailDomain) detailDomain.textContent = nodeData.domain || ''; 
        if(detailStatus) detailStatus.textContent = nodeData.status || ''; 
        if(detailCompletionDate) detailCompletionDate.textContent = nodeData.completion_date || ''; 
        if(detailExpiryDate) detailExpiryDate.textContent = nodeData.expiry_date || ''; 
        if(detailProvider) detailProvider.textContent = nodeData.provider || ''; 
        // For arrays, join or show blank if empty/null
        if(detailPrograms) detailPrograms.textContent = (Array.isArray(nodeData.programs) && nodeData.programs.length > 0) ? nodeData.programs.join(', ') : '';
        if(detailTags) detailTags.textContent = (Array.isArray(nodeData.tags) && nodeData.tags.length > 0) ? nodeData.tags.join(', ') : '';

        // --- Handle Notes Section Visibility (REVISED LOGIC) ---
        if (notesSection && detailNotesPre) { // Ensure both elements exist
            const notesContent = nodeData.notes;

            // Make sure the section wrapper itself is visible (containing the "Notes:" label)
             // It might need 'block' or 'flex' depending on how its label is styled
            notesSection.style.display = 'block';

            if (notesContent && notesContent.trim() !== '') {
                // Notes exist: Populate <pre> and make <pre> visible
                detailNotesPre.textContent = notesContent;
                detailNotesPre.style.display = 'block'; // Or 'inline-block' etc. if needed
            } else {
                // Notes are empty: Clear <pre> and HIDE ONLY the <pre> tag
                detailNotesPre.textContent = '';
                detailNotesPre.style.display = 'none';
            }
        }
        // --- End Handle Notes ---

        detailModal.style.display = 'flex'; // Use flex to enable centering
    });

    // --- Modal Button Event Listeners ---
    // Detail Modal Close
    if (closeDetailModalButton) { closeDetailModalButton.onclick = hideAllModals; }
    else { console.warn("Detail modal close button not found."); }

    // Detail Modal Edit Button (Listener still attached even if hidden)
    if (editNodeButton) {
        editNodeButton.onclick = function() {
            const nodeId = detailId?.textContent;
            if (!nodeId || nodeId === 'N/A' || !cyInstance) { /* ... error ... */ return; }
            try {
                const node = cyInstance.$id(nodeId);
                if (node.length > 0 && !node.isParent()) {
                    const nodeData = node.data();
                    hideAllModals();
                    showEditModal(nodeData);
                } else { /* ... error handling ... */ hideAllModals(); }
            } catch(error) { /* ... error handling ... */ hideAllModals(); }
        }
    } else { console.warn("Detail modal edit button not found."); }

    // Edit Modal Close
    if (closeEditModalButton) { closeEditModalButton.onclick = hideAllModals; }
    else { console.warn("Edit modal close button not found."); }

    // Edit Modal Cancel
    if (cancelEditButton) { cancelEditButton.onclick = hideAllModals; }
    else { console.warn("Edit modal cancel button not found."); }

    // Edit Modal Form Submission (Save)
    if (editForm) {
        editForm.onsubmit = function(event) {
            event.preventDefault();
            if (!selectedNodeDataForEdit || !selectedNodeDataForEdit.id || !cyInstance) { /* ... */ hideAllModals(); return; }
            const nodeId = selectedNodeDataForEdit.id;
            // ... (Validation) ...
            if (!editNameInput.value.trim()) { alert("Node name cannot be empty."); return; }
            // ... (Prepare updatedData object including preserving relationships) ...
             const programsArray = editProgramsInput.value ? editProgramsInput.value.split(',').map(s => s.trim()).filter(Boolean) : [];
             const tagsArray = editTagsInput.value ? editTagsInput.value.split(',').map(s => s.trim()).filter(Boolean) : [];
             const updatedData = {
                 id: nodeId, name: editNameInput.value.trim(), type: editTypeInput.value, domain: editDomainInput.value.trim(),
                 status: editStatusInput.value, completion_date: editCompletionDateInput.value || null,
                 expiry_date: editExpiryDateInput.value || null, provider: editProviderInput.value.trim(),
                 programs: programsArray, tags: tagsArray, notes: editNotesInput.value.trim(),
                 prerequisites: cyInstance.$id(nodeId).data('prerequisites') || [],
                 maintenance_contribution_for: cyInstance.$id(nodeId).data('maintenance_contribution_for') || []
             };

            console.log(`Attempting to update node '${nodeId}'...`);
            // ... (Try/Catch block to update Cytoscape node visually) ...
             let updateSuccessful = false;
             try {
                 const node = cyInstance.$id(nodeId);
                 if(node.length > 0) {
                     node.data(updatedData);
                     console.log(`Node '${nodeId}' updated visually.`);
                     node.addClass('updated').delay(1200).removeClass('updated');
                     updateSuccessful = true;
                 } else { console.error(`Node '${nodeId}' not found.`); }
            } catch (error) { console.error(`Error updating node: ${error}`); }

            // Update Master Data & Trigger Download
            if(updateSuccessful) {
                if(updateMasterDataCallback) { updateMasterDataCallback(updatedData); }
                triggerJsonDownload(); // Trigger download
            }
            hideAllModals();
        };
    } else { console.error("Edit form element not found."); }

    // Window Click Listener for closing modals by clicking outside
     window.addEventListener('click', function(event) {
         if (detailModal && event.target == detailModal) { hideAllModals(); }
         if (editModal && event.target == editModal) { hideAllModals(); }
     });

    console.log("Modal event listeners setup complete.");
} // ***** END of setupModalEventListeners function *****


// --- Setup for UI Elements (like Legend Toggle) ---
// ***** ENSURE THIS FUNCTION WRAPPER AND EXPORT ARE PRESENT *****
export function setupUIEventListeners() {
    console.log("Setting up UI event listeners...");
    const legendToggleButton = getElement('legend-toggle');
    const legendContent = getElement('legendContent');

    if (legendToggleButton && legendContent) {
        // Prevent adding multiple listeners if this runs again somehow
        legendToggleButton.removeEventListener('click', toggleLegend); // Remove previous listener first
        legendToggleButton.addEventListener('click', toggleLegend); // Add the listener
         console.log("Legend toggle event listener added.");
    } else {
        console.warn("Legend UI elements not found. Toggle not initialized.");
    }
    // Add other general UI listeners here
}

// Helper function for the legend toggle listener
function toggleLegend() {
    const legendContent = getElement('legendContent');
    if (legendContent) {
        const isHidden = legendContent.style.display === 'none' || legendContent.style.display === '';
        legendContent.style.display = isHidden ? 'block' : 'none';
        console.log(`Legend toggled ${isHidden ? 'visible' : 'hidden'}`);
    }
}