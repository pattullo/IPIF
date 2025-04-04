import { cytoscapeConfig, domainIcons } from './config.js';

export function setupDomains(data) {
    const domains = [...new Set(data.learning_items.map(item => item.domain))];
    const visualizationContainer = document.querySelector('.visualization-container');
    
    // Clear existing domain bands
    visualizationContainer.querySelectorAll('.domain-band').forEach(el => el.remove());
    
    // Calculate total height needed
    const totalHeight = domains.length * 200; // 200px per domain
    const minHeight = Math.max(totalHeight, visualizationContainer.clientHeight);
    
    // Set the container and cy element heights
    document.getElementById('cy').style.height = `${minHeight}px`;
    
    domains.forEach((domain, index) => {
        const bandDiv = createDomainBand(domain, index);
        visualizationContainer.appendChild(bandDiv);
    });

    return domains;
}

function createDomainBand(domain, index) {
    const bandDiv = document.createElement('div');
    bandDiv.className = 'domain-band';
    bandDiv.style.top = `${index * 200}px`; // Position from top of visualization container
    bandDiv.style.height = '200px';
    bandDiv.style.width = '100%';
    bandDiv.style.position = 'absolute';
    
    const labelDiv = createDomainLabel(domain);
    bandDiv.appendChild(labelDiv);
    
    return bandDiv;
}

function createDomainLabel(domain) {
    const labelDiv = document.createElement('div');
    labelDiv.className = 'domain-label';
    
    const icon = domainIcons.get(domain) || 'fas fa-circle';
    labelDiv.innerHTML = `
        <i class="${icon}"></i>
        <span>${domain}</span>
    `;
    
    return labelDiv;
}