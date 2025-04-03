export const cytoscapeConfig = {
    container: document.getElementById('cy'),
    style: [
        {
            selector: 'node',
            style: {
                'label': 'data(name)',
                'text-wrap': 'wrap',
                'text-valign': 'center',
                'text-halign': 'center',
                'background-color': '#666',
                'width': 150,
                'height': 75,
                'font-size': '12px',
                'text-max-width': '140px',
                'padding': '10px',
                'border-width': 2,
                'border-color': '#555'
            }
        },
        {
            selector: 'node[type = "Certification"]',
            style: {
                'shape': 'hexagon'
            }
        },
        {
            selector: 'node[status = "Completed"]',
            style: {
                'background-color': '#4CAF50',
                'border-width': 2,
                'border-color': '#2E7D32'
            }
        },
        {
            selector: 'node[status = "In Progress"]',
            style: {
                'background-color': '#2196F3',
                'border-width': 2,
                'border-color': '#1565C0'
            }
        },
        {
            selector: 'node[status = "Planned"]',
            style: {
                'background-color': '#9E9E9E',
                'border-width': 2,
                'border-color': '#616161'
            }
        },
        {
            selector: 'edge',
            style: {
                'width': 3,
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier'
            }
        }
    ],
    minZoom: 0.5,
    maxZoom: 2,
    selectable: true,
    grabbable: true,
    zoomingEnabled: true,
    userZoomingEnabled: true,
    panningEnabled: true,
    userPanningEnabled: true,
    boxSelectionEnabled: false,
    autoungrabify: false,
    autounselectify: false
};

export const domainIcons = new Map([
    ['Computer Science', 'fas fa-laptop-code'],
    ['Mathematics', 'fas fa-square-root-alt'],
    ['Engineering', 'fas fa-cogs'],
    ['First Aid', 'fas fa-medkit'],
    ['Project Management', 'fas fa-tasks'],
    ['Cybersecurity', 'fas fa-shield-alt']
]);
