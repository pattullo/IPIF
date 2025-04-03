import { createTimeline } from './timeline.js';
import { setupDomains } from './domains.js';
import { cytoscapeConfig } from './config.js';

export function initializeVisualization(data) {
    const cy = cytoscape(cytoscapeConfig);
    
    createTimeline(data);
    setupDomains(data);
    
    const elements = createElements(data);
    cy.add(elements);
    
    applyLayout(cy);
    cy.fit(50); // 50px padding
    
    return cy;
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

    return elements;
}

function applyLayout(cy) {
    const layout = cy.layout({
        name: 'dagre',
        rankDir: 'LR',
        align: 'DL',
        spacingFactor: 1.5,
        nodeDimensionsIncludeLabels: true,
        rankSep: 100,
        nodeSep: 50,
        ranker: 'network-simplex'
    });

    layout.run();
}
