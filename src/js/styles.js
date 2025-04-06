// Defines the visual style for the Cytoscape graph elements

export const ipifStyles = [
    // Default CHILD node style
    { selector: 'node[!isParent]', style: { 'background-color': '#888', 'label': 'data(name)', 'width': '60px', 'height': '60px', 'font-size': '9px', 'color': '#fff', 'text-outline-color': '#000', 'text-outline-width': 1, 'text-valign': 'bottom', 'text-halign': 'center', 'text-margin-y': '3px', 'text-wrap': 'wrap', 'text-max-width': '55px', 'z-compound-depth': 'top' }},
    // PARENT Node Styles (Domain Lanes)
    { selector: 'node:parent', style: { 'label': 'data(name)', 'background-opacity': 0.15, 'border-width': 1, 'border-color': '#ccc', 'shape': 'rectangle', 'font-size': '16px', 'font-weight': 'bold', 'color': '#555', 'text-halign': 'left', 'text-valign': 'center', 'text-margin-x': '15px', 'padding': '30px', 'z-compound-depth': 'bottom' }},
    // Alternating background colors for domain lanes
    { selector: 'node:parent.domain-even', style: { 'background-color': '#e9f5ff' } }, // Light blue-ish
    { selector: 'node:parent.domain-odd', style: { 'background-color': '#f5f5f5' } }, // Light grey-ish
    // Child Status-based styling
    { selector: 'node[!isParent][status="Completed"]', style: { 'background-color': '#4CAF50' } }, // Green
    { selector: 'node[!isParent][status="In Progress"]', style: { 'background-color': '#FFC107' } }, // Amber
    { selector: 'node[!isParent][status="Planned"]', style: { 'background-color': '#9E9E9E' } }, // Grey
    { selector: 'node[!isParent][status="Expired"]', style: { 'background-color': '#F44336', 'border-width': 2, 'border-color': '#000' } }, // Red
    // Child Type-based styling
    { selector: 'node[!isParent][type="Certification"]', style: { 'shape': 'hexagon' } },
    { selector: 'node[!isParent][type="Course"]', style: { 'shape': 'rectangle' } },
    { selector: 'node[!isParent][type="Milestone"]', style: { 'shape': 'star' } },
    { selector: 'node[!isParent][type="MaintenanceActivity"]', style: { 'shape': 'diamond' } },
    { selector: 'node[!isParent][type="Skill"]', style: { 'shape': 'round-tag' } },
    { selector: 'node[!isParent][type="Module"]', style: { 'shape': 'round-rectangle' } },
    // Interaction styling
    { selector: 'node[!isParent]:selected', style: {'border-width': 3, 'border-color': '#03A9F4', 'border-opacity': 1} },
    { selector: 'node:parent:selected', style: {'border-width': 1, 'border-color': '#ccc', 'border-opacity': 0.5} },
    { selector: 'node.hover', style: {'background-color': '#03A9F4'} }, // Applied via JS
    { selector: '.updated', style: {'border-color': 'orange', 'border-width': 4} }, // Visual feedback on save
    // Edge styling
    { selector: 'edge', style: { 'width': 2, 'line-color': '#ccc', 'curve-style': 'bezier', 'z-index': 0 } },
    { selector: 'edge[type="prerequisite"]', style: { 'line-color': '#999', 'target-arrow-shape': 'triangle', 'target-arrow-color': '#999', 'arrow-scale': 1.2 } },
    { selector: 'edge[type="maintenance"]', style: { 'line-color': '#2196F3', 'line-style': 'dotted', 'target-arrow-shape': 'triangle', 'target-arrow-color': '#2196F3', 'arrow-scale': 1.2 } },
    { selector: 'edge.highlighted', style: { 'line-color': '#FF5722', 'width': 4 } }
];