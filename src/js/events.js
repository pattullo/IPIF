import { showNodeModal } from './modal.js';
import { handleSearch, handleFilterChange } from './filters.js';
import { setupLegend } from './legend.js';

export function setupEventListeners(cy) {
    if (!cy) {
        console.error('Cytoscape instance not initialized');
        return;
    }

    console.log('Setting up event listeners...');

    // Set up legend
    try {
        setupLegend();
    } catch (error) {
        console.error('Error setting up legend:', error);
    }

    // Safe removal of existing listeners
    try {
        cy.off('*'); // Replace removeAllListeners with off('*')
    } catch (error) {
        console.error('Error removing existing listeners:', error);
    }

    // Node tap handling with error protection
    try {
        cy.on('tap', 'node', function(evt) {
            console.log('Node tapped:', this.id());
            showNodeModal(this);
            evt.preventDefault();
        });
    } catch (error) {
        console.error('Error setting up node tap listener:', error);
    }

    // Search input handling
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            try {
                handleSearch(e.target.value, cy);
            } catch (error) {
                console.error('Error handling search:', error);
            }
        });
    }

    // Filter change handling with error protection
    const setupFilter = (filterId) => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', () => {
                try {
                    handleFilterChange(cy);
                } catch (error) {
                    console.error(`Error handling ${filterId} change:`, error);
                }
            });
        }
    };

    setupFilter('domain-filter');
    setupFilter('program-filter');
    setupFilter('provider-filter');

    // Window resize handling with debounce
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (cy) {
                try {
                    cy.fit(50);
                } catch (error) {
                    console.error('Error handling resize:', error);
                }
            }
        }, 250);
    });

    // Cursor styling
    const container = document.getElementById('cy');
    if (container) {
        container.style.cursor = 'default';
    }

    console.log('Event listeners setup complete');
    console.log('Number of nodes:', cy.nodes().length);
}