import { initializeVisualization } from './visualization.js';
import { setupEventListeners } from './events.js';
import { setupFilters } from './filters.js';

document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('Loading data...');
        const response = await fetch('data/sample-data.json');
        const data = await response.json();
        console.log('Data loaded:', data);
        
        setupFilters(data);
        console.log('Filters setup complete');
        
        const cy = initializeVisualization(data);
        console.log('Visualization initialized');
        
        setupEventListeners(cy);
        console.log('Event listeners setup complete');
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});
