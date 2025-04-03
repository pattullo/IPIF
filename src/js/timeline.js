export function createTimeline(data) {
    const timelineEl = document.getElementById('timeline');
    const dates = getValidDates(data);
    if (dates.length === 0) return;

    const { minDate, maxDate } = getDateRange(dates);
    const segments = createTimelineSegments(minDate, maxDate, data);
    
    segments.forEach(segment => timelineEl.appendChild(segment));
}

function getValidDates(data) {
    return data.learning_items
        .filter(item => item.completion_date)
        .map(item => new Date(item.completion_date))
        .sort((a, b) => a - b);
}

function getDateRange(dates) {
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    maxDate.setFullYear(maxDate.getFullYear() + 1); // Add buffer for planned items
    return { minDate, maxDate };
}

function createTimelineSegments(minDate, maxDate, data) {
    const segments = [];
    let currentDate = new Date(minDate);
    let lastActivityDate = null;
    
    while (currentDate <= maxDate) {
        const year = currentDate.getFullYear();
        const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
        
        const hasActivity = checkForActivity(data, year, quarter);
        
        if (hasActivity) {
            segments.push(createSegment(year, quarter));
            lastActivityDate = new Date(currentDate);
        } else if (lastActivityDate) {
            // Add gap indicator if there's a significant gap (more than 2 quarters)
            const gapSize = getQuartersDifference(lastActivityDate, currentDate);
            if (gapSize > 2) {
                segments.push(createGapSegment());
                lastActivityDate = null;
            }
        }
        
        // Move to next quarter
        currentDate.setMonth(currentDate.getMonth() + 3);
    }
    
    // Add planned section
    segments.push(createPlannedSegment());
    
    return segments;
}

function checkForActivity(data, year, quarter) {
    return data.learning_items.some(item => {
        if (!item.completion_date) return false;
        const itemDate = new Date(item.completion_date);
        return itemDate.getFullYear() === year && 
               Math.floor(itemDate.getMonth() / 3) + 1 === quarter;
    });
}

function createSegment(year, quarter) {
    const segment = document.createElement('div');
    segment.className = 'timeline-segment';
    segment.innerHTML = `
        <div class="timeline-year">${year}</div>
        <div class="timeline-quarter">Q${quarter}</div>
    `;
    return segment;
}

function createGapSegment() {
    const segment = document.createElement('div');
    segment.className = 'timeline-segment timeline-gap';
    segment.innerHTML = `<div class="timeline-gap-indicator">...</div>`;
    return segment;
}

function createPlannedSegment() {
    const segment = document.createElement('div');
    segment.className = 'timeline-segment planned';
    segment.innerHTML = `
        <div class="timeline-year">Planned</div>
        <div class="timeline-quarter">Future Items</div>
    `;
    return segment;
}

function getQuartersDifference(date1, date2) {
    const quarterMonths = 3;
    const monthsDiff = (date2.getFullYear() - date1.getFullYear()) * 12 
                      + date2.getMonth() - date1.getMonth();
    return Math.floor(monthsDiff / quarterMonths);
}
