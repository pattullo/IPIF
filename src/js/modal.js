export function showNodeModal(node) {
    console.log('Showing modal for node:', node.data());
    
    const modal = document.getElementById('node-modal');
    const title = document.getElementById('modal-title');
    const viewContent = document.getElementById('modal-view-content');
    const editContent = document.getElementById('modal-edit-content');
    
    // Reset modal state
    viewContent.classList.remove('hidden');
    editContent.classList.add('hidden');
    document.getElementById('modal-edit').classList.remove('hidden');
    
    // Update content
    title.textContent = node.data('name');
    viewContent.innerHTML = createViewContent(node);
    editContent.innerHTML = createEditContent(node);
    
    // Setup controls
    setupModalControls(modal, node);
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Ensure modal is visible and centered
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
}


function createViewContent(node) {
    let content = `
        <p><strong>Type:</strong> ${node.data('type')}</p>
        <p><strong>Status:</strong> ${node.data('status')}</p>
        <p><strong>Domain:</strong> ${node.data('domain')}</p>
        <p><strong>Provider:</strong> ${node.data('provider') || 'Not specified'}</p>
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
            viewContent.classList.remove('hidden');
            editContent.classList.add('hidden');
            editBtn.classList.remove('hidden');
        }
    };
}

function handleFormSubmit(form, node, modal) {
    const formData = new FormData(form);
    
    // Update node data
    const updatedData = {
        name: formData.get('name'),
        status: formData.get('status'),
        url: formData.get('url')
    };

    // Update node in visualization
    Object.entries(updatedData).forEach(([key, value]) => {
        node.data(key, value);
    });
    
    // Update node styling based on new status
    updateNodeStyling(node);
    
    // Save changes to JSON file
    saveChangesToJSON(node.data());
    
    // Reset modal to view mode
    document.getElementById('modal-view-content').classList.remove('hidden');
    document.getElementById('modal-edit-content').classList.add('hidden');
    document.getElementById('modal-edit').classList.remove('hidden');
    
    // Refresh modal content
    showNodeModal(node);
}

async function saveChangesToJSON(nodeData) {
    try {
        const response = await fetch('/api/update-node', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nodeData)
        });

        if (!response.ok) {
            throw new Error('Failed to save changes');
        }

        console.log('Changes saved successfully');
    } catch (error) {
        console.error('Error saving changes:', error);
        alert('Failed to save changes. Please try again.');
    }
}

function updateNodeStyling(node) {
    node.style('opacity', 0.99);
    setTimeout(() => node.style('opacity', 1), 50);
}