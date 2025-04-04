import { initializeVisualization } from './visualization.js';
import { setupEventListeners } from './events.js';
import { setupFilters } from './filters.js';

document.addEventListener('DOMContentLoaded', async function() {
    let cy = null;
    
    try {
        console.log('Loading data...');
        const response = await fetch('data/sample-data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data loaded:', data);

        await setupFilters(data);
        console.log('Filters setup complete');

        cy = await initializeVisualization(data);
        console.log('Visualization initialized');

        if (cy) {
            setupEventListeners(cy);
            console.log('Event listeners setup complete');
        } else {
            throw new Error('Cytoscape instance not created');
        }
    } catch (error) {
        console.error('Error initializing application:', error);
        // Add user-friendly error handling here
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.textContent = 'An error occurred while loading the visualization. Please try refreshing the page.';
            errorContainer.style.display = 'block';
        }
    }
});