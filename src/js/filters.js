export function setupFilters(data) {
    populateFilterOptions('domain-filter', getDomains(data));
    populateFilterOptions('program-filter', getPrograms(data));
}

export function handleSearch(searchTerm, cy) {
    const normalizedSearch = searchTerm.toLowerCase();
    
    cy.nodes().forEach(node => {
        const matches = node.data('name').toLowerCase().includes(normalizedSearch);
        node.style('opacity', matches || searchTerm === '' ? 1 : 0.2);
    });
}

export function handleFilterChange(cy) {
    const domain = document.getElementById('domain-filter').value;
    const program = document.getElementById('program-filter').value;
    
    cy.nodes().forEach(node => {
        const domainMatch = domain === 'all' || node.data('domain') === domain;
        const programMatch = program === 'all' || 
                           (node.data('programs') || []).includes(program);
        
        node.style('opacity', domainMatch && programMatch ? 1 : 0.2);
    });
}

function populateFilterOptions(selectId, options) {
    const select = document.getElementById(selectId);
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        select.appendChild(opt);
    });
}

function getDomains(data) {
    return [...new Set(data.learning_items.map(item => item.domain))];
}

function getPrograms(data) {
    return [...new Set(data.learning_items
        .flatMap(item => item.programs || []))];
}
