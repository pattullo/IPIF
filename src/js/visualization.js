import { createTimeline } from './timeline.js';
import { setupDomains } from './domains.js';
import { cytoscapeConfig } from './config.js';
import { showNodeModal } from './modal.js';

// Data validation function
function validateData(data) {
    if (!data || !Array.isArray(data.learning_items)) {
        throw new Error('Invalid data structure: learning_items array is required');
    }

    data.learning_items.forEach((item, index) => {
        if (!item.id || !item.name || !item.domain) {
            throw new Error(`Required fields missing in learning item at index ${index}`);
        }
    });

    return true;
}

export function initializeVisualization(data) {
    console.log('Starting visualization initialization');
    
    try {
        // Validate input data
        validateData(data);

        // Create Cytoscape instance
        const cy = cytoscape(cytoscapeConfig);
        if (!cy) {
            throw new Error('Failed to create Cytoscape instance');
        }

        // Initialize components
        try {
            createTimeline(data);
            setupDomains(data);
        } catch (error) {
            console.error('Error initializing components:', error);
            throw new Error('Component initialization failed');
        }

        // Create and add elements
        const elements = createElements(data);
        cy.add(elements);

        // Apply layout
        applyLayout(cy);
        cy.fit(50);

        // Set up event handlers
        setupEventHandlers(cy);

        return cy;
    } catch (error) {
        console.error('Error in initializeVisualization:', error);
        // Notify the user of the error
        document.getElementById('cy').innerHTML = `
            <div class="error-message">
                Failed to initialize visualization: ${error.message}
            </div>`;
        throw error;
    }
}

function createElements(data) {
    const elements = [];

    try {
        // Add nodes
        data.learning_items.forEach(item => {
            elements.push({
                group: 'nodes',
                data: {
                    id: item.id,
                    name: item.name,
                    status: item.status || 'pending',
                    type: item.type || 'default',
                    domain: item.domain,
                    completion_date: item.completion_date,
                    expiry_date: item.expiry_date,
                    url: item.url,
                    provider: item.provider
                }
            });
        });

        // Add edges
        data.learning_items.forEach(item => {
            if (Array.isArray(item.prerequisites)) {
                item.prerequisites.forEach(prereq => {
                    elements.push({
                        group: 'edges',
                        data: {
                            id: `$${prereq}-$$ {item.id}`,
                            source: prereq,
                            target: item.id
                        }
                    });
                });
            }
        });

        return elements;
    } catch (error) {
        console.error('Error creating elements:', error);
        throw new Error('Failed to create visualization elements');
    }
}

function setupEventHandlers(cy) {
    const container = document.getElementById('cy');
    if (!container) {
        throw new Error('Visualization container not found');
    }

    // Container click handler
    container.addEventListener('click', (event) => {
        const rect = container.getBoundingClientRect();
        const position = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };

        const clickedElements = cy.elementsAt(position);
        const clickedNode = clickedElements.filter('node')[0];
        
        if (clickedNode) {
            showNodeModal(clickedNode);
        }
    });

    // Node-specific event handlers
    cy.nodes().forEach(node => {
        node.on('tap', function(evt) {
            showNodeModal(this);
            evt.preventDefault();
        });

        node.on('mouseover', function() {
            this.style('border-width', '3px');
            document.body.style.cursor = 'pointer';
        });

        node.on('mouseout', function() {
            this.style('border-width', '2px');
            document.body.style.cursor = 'default';
        });
    });
}

function applyLayout(cy) {
    try {
        cy.reset();

        const domains = [...new Set(cy.nodes().map(node => node.data('domain')))];
        const totalHeight = Math.max(domains.length * 200, 400); // Minimum height of 400px

        cy.container().style.height = `${totalHeight}px`;

        const layout = cy.layout({
            name: 'dagre',
            rankDir: 'LR',
            align: 'DL',
            spacingFactor: 1.2,
            nodeDimensionsIncludeLabels: true,
            rankSep: 75,
            nodeSep: 40,
            ranker: 'network-simplex',
            fit: true,
            padding: 50,
            animate: false,
            positions: function(node) {
                const domain = node.data('domain');
                const domainIndex = domains.indexOf(domain);
                const bandHeight = 200;
                return {
                    y: (domainIndex * bandHeight) + (bandHeight / 2)
                };
            }
        });

        layout.run();

        // Post-layout adjustments
        setTimeout(() => {
            adjustViewport(cy);
        }, 100);

    } catch (error) {
        console.error('Error applying layout:', error);
        throw new Error('Failed to apply visualization layout');
    }
}

function adjustViewport(cy) {
    const bb = cy.elements().boundingBox();
    const containerWidth = cy.width();
    const widthZoom = (containerWidth / bb.w) * 0.9;
    
    cy.zoom({
        level: Math.min(Math.max(widthZoom, 0.5), 2),
        position: {
            x: bb.x1 + bb.w/2,
            y: bb.y1 + bb.h/2
        }
    });

    document.querySelector('.visualization-container').scrollTop = 0;
    cy.center();
}
