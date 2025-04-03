import { domainIcons } from './config.js';

export function setupDomains(data) {
    const domains = [...new Set(data.learning_items.map(item => item.domain))];
    const visualizationContainer = document.querySelector('.visualization-container');
    
    domains.forEach((domain, index) => {
        const bandDiv = createDomainBand(domain, index);
        visualizationContainer.appendChild(bandDiv);
    });

    return domains;
}

function createDomainBand(domain, index) {
    const bandDiv = document.createElement('div');
    bandDiv.className = 'domain-band';
    bandDiv.style.top = `${index * 200}px`; // Height per domain
    bandDiv.style.height = '200px';
    
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
