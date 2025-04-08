// Defines the layout configuration for Cytoscape

export const ipifLayout = {
    name: 'dagre',
    rankDir: 'LR',     // Left-to-Right flow
    fit: false,        // We handle fitting manually after layout
    padding: 50,       // Internal padding for layout calculations
    spacingFactor: 1.25, // Adjusts spacing between nodes/ranks
    nodeSep: 60,       // Separation between nodes in same rank (horizontal)
    edgeSep: 10,       // Separation between edges in same rank
    rankSep: 80,       // Separation between ranks (vertical in LR)
    // nodeDimensionsIncludeLabels: true, // Consider enabling if labels cause overlaps
};