import { createTimeline } from './timeline.js';
import { setupDomains } from './domains.js';
import { cytoscapeConfig } from './config.js';
import { showNodeModal } from './modal.js';

export async function initializeVisualization(data) {
    console.log('Starting visualization initialization');
    try {
        // Create Cytoscape instance
        const cy = cytoscape(cytoscapeConfig);
        
        // Wait for all async operations to complete
        await Promise.all([
            createTimeline(data),
            setupDomains(data)
        ]);
        
        // Create and add elements
        const elements = createElements(data);
        cy.add(elements);
        
        // Apply layout and return promise
        await applyLayoutAsync(cy);
        
        cy.fit(50);
        
        // Set up event listeners
        setupEventListeners(cy);
        
        return cy;
    } catch (error) {
        console.error('Error in initializeVisualization:', error);
        throw error;
    }
}

function createElements(data) {
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
                url: item.url,
                provider: item.provider
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
                        id: `$${prereq}-$$ {item.id}`,
                        source: prereq,
                        target: item.id
                    }
                });
            });
        }
    });

    return elements;
}

function applyLayoutAsync(cy) {
    return new Promise((resolve, reject) => {
        try {
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
                    const domains = [...new Set(cy.nodes().map(node => node.data('domain')))];
                    const domainIndex = domains.indexOf(domain);
                    const bandHeight = 200;
                    return {
                        y: (domainIndex * bandHeight) + (bandHeight / 2)
                    };
                },
                ready: function() {
                    setTimeout(() => {
                        adjustZoomAndPosition(cy);
                        resolve();
                    }, 100);
                },
                error: function(err) {
                    reject(err);
                }
            });
            
            layout.run();
        } catch (error) {
            reject(error);
        }
    });
}

function setupEventListeners(cy) {
    const container = document.getElementById('cy');
    
    // Container click handler
    container.addEventListener('click', async (event) => {
        try {
            const rect = container.getBoundingClientRect();
            const position = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
            
            const clickedElements = cy.elementsAt(position);
            const clickedNode = clickedElements.filter('node')[0];
            
            if (clickedNode) {
                await showNodeModal(clickedNode);
            }
        } catch (error) {
            console.error('Error handling click event:', error);
        }
    });
    
    // Node-specific event handlers
    cy.nodes().forEach(node => {
        node.on('tap', async function(evt) {
            try {
                evt.preventDefault();
                await showNodeModal(this);
            } catch (error) {
                console.error('Error handling node tap:', error);
            }
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

function adjustZoomAndPosition(cy) {
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
