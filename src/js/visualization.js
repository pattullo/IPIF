import { createTimeline } from './timeline.js';
import { setupDomains } from './domains.js';
import { cytoscapeConfig } from './config.js';
import { showNodeModal } from './modal.js';

export function initializeVisualization(data) {
    console.log('Starting visualization initialization');
    
    try {
        console.log('Creating Cytoscape instance');
        const cy = cytoscape(cytoscapeConfig);
        console.log('Cytoscape instance created:', cy);
        
        console.log('Setting up timeline');
        createTimeline(data);
        
        console.log('Setting up domains');
        setupDomains(data);
        
        console.log('Creating elements');
        const elements = createElements(data);
        console.log('Elements created:', elements);
        
        console.log('Adding elements to graph');
        cy.add(elements);
        
        console.log('Applying layout');
        applyLayout(cy);
        
        console.log('Fitting view');
        cy.fit(50);

        // Add direct click handler to container
        const container = document.getElementById('cy');
        container.addEventListener('click', (event) => {
            console.log('Container clicked', event);
            
            // Get click position relative to container
            const rect = container.getBoundingClientRect();
            const position = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
            
            // Find clicked node
            const clickedElements = cy.elementsAt(position);
            const clickedNode = clickedElements.filter('node')[0];
            
            if (clickedNode) {
                console.log('Node clicked:', clickedNode.id());
                showNodeModal(clickedNode);
            }
        });
        
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
                        id: `${prereq}-${item.id}`,
                        source: prereq,
                        target: item.id
                    }
                });
            });
        }
    });

    return elements;
}

function applyLayout(cy) {
    // Reset any previous transformations
    cy.reset();
    
    // Calculate the total height needed based on number of domains
    const domains = [...new Set(cy.nodes().map(node => node.data('domain')))];
    const totalHeight = domains.length * 200;
    
    // Ensure the container is tall enough
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
            const yPosition = (domainIndex * bandHeight) + (bandHeight / 2);
            return {
                y: yPosition
            };
        }
    });

    // Run layout and bind events after it's complete
    layout.run();

    // After layout completes
    setTimeout(() => {
        // Adjust zoom to fit width while maintaining domain heights
        const bb = cy.elements().boundingBox();
        const containerWidth = cy.width();
        const widthZoom = containerWidth / bb.w * 0.9;
        
        cy.zoom({
            level: Math.min(Math.max(widthZoom, 0.5), 2),
            position: {
                x: bb.x1 + bb.w/2,
                y: bb.y1 + bb.h/2
            }
        });
        
        // Scroll to top of visualization area
        document.querySelector('.visualization-container').scrollTop = 0;
        
        cy.center();

        // Explicitly bind click events to each node
        cy.nodes().forEach(node => {
            node.on('tap', function(evt) {
                console.log('Direct node tap:', this.id());
                showNodeModal(this);
                evt.preventDefault();
            });
            
            node.on('mouseover', function(evt) {
                this.style('border-width', '3px');
                document.body.style.cursor = 'pointer';
            });
            
            node.on('mouseout', function(evt) {
                this.style('border-width', '2px');
                document.body.style.cursor = 'default';
            });
        });

        // Log the number of nodes with events
        console.log('Events bound to', cy.nodes().length, 'nodes');
    }, 100);
}
