document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let cy = null;
    const domainColors = new Map();
    const domainIcons = new Map([
        ['Computer Science', 'fas fa-laptop-code'],
        ['Mathematics', 'fas fa-square-root-alt'],
        ['Engineering', 'fas fa-cogs'],
        ['First Aid', 'fas fa-medkit'],
        ['Project Management', 'fas fa-tasks'],
        ['Cybersecurity', 'fas fa-shield-alt']
    ]);

    // Initialize Cytoscape
    function initCytoscape() {
        cy = cytoscape({
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
                        'padding': '10px'
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
                        'curve-style': 'bezier',
                        'opacity': 0.8
                    }
                }
            ]
        });

        return cy;
    }

    // Timeline Management
    function createTimeline(data) {
        const timelineEl = document.getElementById('timeline');
        const dates = data.learning_items
            .filter(item => item.completion_date)
            .map(item => new Date(item.completion_date));

        if (dates.length === 0) return;

        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        const currentDate = new Date();
        
        // Add one year buffer for planned items
        maxDate.setFullYear(maxDate.getFullYear() + 1);

        let currentYear = minDate.getFullYear();
        const endYear = maxDate.getFullYear();

        while (currentYear <= endYear) {
            const yearSegment = document.createElement('div');
            yearSegment.className = 'timeline-segment';
            yearSegment.innerHTML = `
                <div class="timeline-year">${currentYear}</div>
                <div class="timeline-quarter">Q1 Q2 Q3 Q4</div>
            `;
            timelineEl.appendChild(yearSegment);
            currentYear++;
        }

        // Add "Planned" section
        const plannedSegment = document.createElement('div');
        plannedSegment.className = 'timeline-segment';
        plannedSegment.innerHTML = `
            <div class="timeline-year">Planned</div>
            <div class="timeline-quarter">Future Items</div>
        `;
        timelineEl.appendChild(plannedSegment);
    }

        // Domain Management
        function setupDomains(data) {
            const domains = [...new Set(data.learning_items.map(item => item.domain))];
            const domainLabelsEl = document.getElementById('domain-labels');
            const visualizationContainer = document.querySelector('.visualization-container');
            
            // Create domain bands and labels
            domains.forEach((domain, index) => {
                // Create domain label
                const labelDiv = document.createElement('div');
                labelDiv.className = 'domain-label';
                const icon = domainIcons.get(domain) || 'fas fa-circle';
                labelDiv.innerHTML = `
                    <i class="${icon}"></i>
                    <span>${domain}</span>
                `;
                domainLabelsEl.appendChild(labelDiv);
    
                // Create domain band
                const bandDiv = document.createElement('div');
                bandDiv.className = 'domain-band';
                bandDiv.style.top = `${index * 200}px`; // Height per domain
                bandDiv.style.height = '200px';
                visualizationContainer.appendChild(bandDiv);
    
                // Store domain color for consistency
                domainColors.set(domain, `hsla(${index * 360/domains.length}, 70%, 95%, 0.5)`);
            });
    
            return domains;
        }
    
        // Node Modal Management
        function setupNodeModal() {
            const modal = document.getElementById('node-modal');
            const closeBtn = document.getElementById('modal-close');
            const editBtn = document.getElementById('modal-edit');
            
            closeBtn.onclick = () => modal.classList.add('hidden');
            
            // Close modal when clicking outside
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            };
    
            editBtn.onclick = () => {
                const viewContent = document.getElementById('modal-view-content');
                const editContent = document.getElementById('modal-edit-content');
                viewContent.classList.add('hidden');
                editContent.classList.remove('hidden');
                editBtn.classList.add('hidden');
            };
        }
    
        function showNodeModal(node) {
            const modal = document.getElementById('node-modal');
            const title = document.getElementById('modal-title');
            const viewContent = document.getElementById('modal-view-content');
            const editBtn = document.getElementById('modal-edit');
            
            title.textContent = node.data('name');
            
            // Prepare view content
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
    
            // Add prerequisites if any
            const prerequisites = node.incomers('node');
            if (prerequisites.length > 0) {
                content += '<p><strong>Prerequisites:</strong></p><ul>';
                prerequisites.forEach(prereq => {
                    content += `<li>${prereq.data('name')}</li>`;
                });
                content += '</ul>';
            }
    
            viewContent.innerHTML = content;
            editBtn.classList.remove('hidden');
            modal.classList.remove('hidden');
        }
    
        // Legend Management
        function setupLegend() {
            const legendToggle = document.getElementById('legend-toggle');
            const legendPanel = document.getElementById('legend-panel');
            const legendClose = document.getElementById('legend-close');
    
            legendToggle.onclick = () => {
                legendPanel.classList.toggle('hidden');
            };
    
            legendClose.onclick = () => {
                legendPanel.classList.add('hidden');
            };
        }

            // Layout Management
    function applyLayout() {
        const layout = cy.layout({
            name: 'dagre',
            rankDir: 'LR',
            align: 'DL',
            spacingFactor: 1.5,
            nodeDimensionsIncludeLabels: true,
            rankSep: 100,
            nodeSep: 50,
            ranker: 'network-simplex',
            // Position nodes within their domain bands
            positions: function(node) {
                const domain = node.data('domain');
                const domains = [...domainColors.keys()];
                const domainIndex = domains.indexOf(domain);
                return {
                    y: domainIndex * 200 + 100 // Center in domain band
                };
            }
        });

        layout.run();
    }

    // Main initialization function
    function initializeVisualization(data) {
        // Initialize Cytoscape
        cy = initCytoscape();

        // Setup timeline
        createTimeline(data);

        // Setup domains
        const domains = setupDomains(data);

        // Create elements array
        const elements = [];
        
        // Add nodes
        data.learning_items.forEach(item => {
            elements.push({
                group: 'nodes',
                data: {
                    id: item.id,
                    name: item.name,
                    status: item.status,
                    type: item.type,
                    domain: item.domain,
                    completion_date: item.completion_date,
                    expiry_date: item.expiry_date,
                    url: item.url
                }
            });
        });

        // Add edges
        data.learning_items.forEach(item => {
            if (item.prerequisites) {
                item.prerequisites.forEach(prereq => {
                    elements.push({
                        group: 'edges',
                        data: {
                            id: `${prereq}-${item.id}`,
                            source: prereq,
                            target: item.id
                        }
                    });
                });
            }
        });

        // Add elements to graph
        cy.add(elements);

        // Apply layout
        applyLayout();

        // Setup node click handling
        cy.on('tap', 'node', function(evt) {
            showNodeModal(evt.target);
        });

        // Setup modal
        setupNodeModal();

        // Setup legend
        setupLegend();

        // Fit the viewport to show all elements
        cy.fit(50); // 50px padding
    }

    // Load and initialize
    fetch('data/sample-data.json')
        .then(response => response.json())
        .then(data => {
            initializeVisualization(data);
        })
        .catch(error => {
            console.error('Error loading data:', error);
            // TODO: Add user-friendly error handling
        });

    // Window resize handling
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (cy) {
                cy.fit(50);
            }
        }, 250);
    });
});
