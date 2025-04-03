export function setupFilters(data) {
    populateFilterOptions('domain-filter', getDomains(data));
    populateFilterOptions('program-filter', getPrograms(data));
    populateFilterOptions('provider-filter', getProviders(data));
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
    const provider = document.getElementById('provider-filter').value;
    
    cy.nodes().forEach(node => {
        const domainMatch = domain === 'all' || node.data('domain') === domain;
        const programMatch = program === 'all' || node.data('type') === program;
        const providerMatch = provider === 'all' || node.data('provider') === provider;
        
        const isVisible = domainMatch && programMatch && providerMatch;
        node.style('opacity', isVisible ? 1 : 0.2);
    });
}

function populateFilterOptions(selectId, options) {
    const select = document.getElementById(selectId);
    // Clear existing options except "All"
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Add placeholder text based on filter type
    select.options[0].text = `All ${selectId.split('-')[0]}s`;
    
    // Add new options
    options.forEach(option => {
        if (option) { // Only add non-null/undefined options
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            select.appendChild(opt);
        }
    });
}

function getDomains(data) {
    return [...new Set(data.learning_items.map(item => item.domain))]
        .filter(Boolean)
        .sort();
}

function getPrograms(data) {
    return [...new Set(data.learning_items.map(item => item.type))]
        .filter(Boolean)
        .sort();
}

function getProviders(data) {
    return [...new Set(data.learning_items.map(item => item.provider))]
        .filter(Boolean)
        .sort();
}
