export function setupLegend() {
    const legendToggle = document.getElementById('legend-toggle');
    const legendPanel = document.getElementById('legend-panel');
    const legendClose = document.getElementById('legend-close');

    // Toggle legend visibility
    legendToggle.addEventListener('click', () => {
        legendPanel.classList.toggle('hidden');
    });

    // Close legend
    legendClose.addEventListener('click', () => {
        legendPanel.classList.add('hidden');
    });

    // Close legend when clicking outside
    document.addEventListener('click', (e) => {
        if (!legendPanel.contains(e.target) && 
            !legendToggle.contains(e.target) && 
            !legendPanel.classList.contains('hidden')) {
            legendPanel.classList.add('hidden');
        }
    });

    // Prevent closing when clicking inside legend
    legendPanel.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}
