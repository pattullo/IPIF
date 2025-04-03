import { showNodeModal } from './modal.js';
import { handleSearch, handleFilterChange } from './filters.js';

export function setupEventListeners(cy) {
    // Node click events
    cy.on('tap', 'node', function(evt) {
        showNodeModal(evt.target);
    });

    // Search input
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => handleSearch(e.target.value, cy));

    // Filter changes
    const domainFilter = document.getElementById('domain-filter');
    const programFilter = document.getElementById('program-filter');
    
    domainFilter.addEventListener('change', () => handleFilterChange(cy));
    programFilter.addEventListener('change', () => handleFilterChange(cy));

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
}
