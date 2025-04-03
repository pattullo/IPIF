import { showNodeModal } from './modal.js';
import { handleSearch, handleFilterChange } from './filters.js';
import { setupLegend } from './legend.js';

export function setupEventListeners(cy) {
    console.log('Setting up event listeners...');

    // Set up legend
    setupLegend();

    // Remove all existing listeners
    cy.removeAllListeners();

    // Basic node tap handling
    cy.$('node').on('tap', function(evt) {
        console.log('Node tapped:', this.id());
        showNodeModal(this);
        evt.preventDefault();
    });

    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => handleSearch(e.target.value, cy));
    }

    // Filter changes
    const domainFilter = document.getElementById('domain-filter');
    const programFilter = document.getElementById('program-filter');
    const providerFilter = document.getElementById('provider-filter');
    
    if (domainFilter) domainFilter.addEventListener('change', () => handleFilterChange(cy));
    if (programFilter) programFilter.addEventListener('change', () => handleFilterChange(cy));
    if (providerFilter) providerFilter.addEventListener('change', () => handleFilterChange(cy));

    // Window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (cy) {
                cy.fit(50);
            }
        }, 250);
    });

    // Add CSS to container for cursor
    const container = document.getElementById('cy');
    if (container) {
        container.style.cursor = 'default';
    }

    // Log setup completion
    console.log('Event listeners setup complete');
    console.log('Number of nodes:', cy.nodes().length);
}
