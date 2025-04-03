export function showNodeModal(node) {
    const modal = document.getElementById('node-modal');
    const title = document.getElementById('modal-title');
    const viewContent = document.getElementById('modal-view-content');
    const editContent = document.getElementById('modal-edit-content');
    
    title.textContent = node.data('name');
    viewContent.innerHTML = createViewContent(node);
    editContent.innerHTML = createEditContent(node);
    
    setupModalControls(modal, node);
    modal.classList.remove('hidden');
}

function createViewContent(node) {
    let content = `
        <p><strong>Type:</strong> ${node.data('type')}</p>
        <p><strong>Status:</strong> ${node.data('status')}</p>
        <p><strong>Domain:</strong> ${node.data('domain')}</p>
    `;

    if (node.data('completion_date')) {
        content += `<p><strong>Completed:</strong> ${node.data('completion_date')}</p>`;
    }

    if (node.data('expiry_date')) {
        content += `<p><strong>Expires:</strong> ${node.data('expiry_date')}</p>`;
    }

    if (node.data('url')) {
        content += `<p><strong>Link:</strong> <a href="${node.data('url')}" 
                    target="_blank" class="node-link">${node.data('name')}</a></p>`;
    }

    const prerequisites = node.incomers('node');
    if (prerequisites.length > 0) {
        content += '<p><strong>Prerequisites:</strong></p><ul>';
        prerequisites.forEach(prereq => {
            content += `<li>${prereq.data('name')}</li>`;
        });
        content += '</ul>';
    }

    return content;
}

function createEditContent(node) {
    // Create form fields for editing
    return `
        <form id="edit-form">
            <div class="form-group">
                <label>Name:</label>
                <input type="text" name="name" value="${node.data('name')}">
            </div>
            <div class="form-group">
                <label>Status:</label>
                <select name="status">
                    <option value="Completed" ${node.data('status') === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="In Progress" ${node.data('status') === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Planned" ${node.data('status') === 'Planned' ? 'selected' : ''}>Planned</option>
                </select>
            </div>
            <div class="form-group">
                <label>URL:</label>
                <input type="url" name="url" value="${node.data('url') || ''}">
            </div>
            <div class="form-buttons">
                <button type="submit">Save</button>
                <button type="button" class="cancel">Cancel</button>
            </div>
        </form>
    `;
}

function setupModalControls(modal, node) {
    const closeBtn = document.getElementById('modal-close');
    const editBtn = document.getElementById('modal-edit');
    const viewContent = document.getElementById('modal-view-content');
    const editContent = document.getElementById('modal-edit-content');
    
    closeBtn.onclick = () => modal.classList.add('hidden');
    
    editBtn.onclick = () => {
        viewContent.classList.add('hidden');
        editContent.classList.remove('hidden');
        editBtn.classList.add('hidden');
    };
    
    modal.querySelector('form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormSubmit(e.target, node, modal);
    });
    
    modal.querySelector('.cancel')?.addEventListener('click', () => {
        viewContent.classList.remove('hidden');
        editContent.classList.add('hidden');
        editBtn.classList.remove('hidden');
    });
    
    // Close modal when clicking outside
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            // Reset to view mode
            viewContent.classList.remove('hidden');
            editContent.classList.add('hidden');
            editBtn.classList.remove('hidden');
        }
    };
}

function handleFormSubmit(form, node, modal) {
    // Update node data
    const formData = new FormData(form);
    
    node.data('name', formData.get('name'));
    node.data('status', formData.get('status'));
    node.data('url', formData.get('url'));
    
    // Update node styling based on new status
    updateNodeStyling(node);
    
    // Reset modal to view mode
    document.getElementById('modal-view-content').classList.remove('hidden');
    document.getElementById('modal-edit-content').classList.add('hidden');
    document.getElementById('modal-edit').classList.remove('hidden');
    
    // Refresh modal content
    showNodeModal(node);
}

function updateNodeStyling(node) {
    // Node styling will be handled by Cytoscape style definitions
    // Just trigger a visual update
    node.style('opacity', 0.99);
    setTimeout(() => node.style('opacity', 1), 50);
}
