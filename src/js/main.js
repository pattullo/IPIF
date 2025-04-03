// Main entry point
import { initializeVisualization } from './visualization.js';
import { setupEventListeners } from './events.js';
import { setupFilters } from './filters.js';

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('data/sample-data.json');
        const data = await response.json();
        
        setupFilters(data);
        const cy = initializeVisualization(data);
        setupEventListeners(cy);
    } catch (error) {
        console.error('Error initializing application:', error);
        // TODO: Add user-friendly error handling
    }
});
