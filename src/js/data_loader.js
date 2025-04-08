// Handles fetching and processing data into Cytoscape elements format

// Function to fetch and process learning data for compound layout
export async function loadAndProcessData(url = './data/sample-data.json') { // Ensure path is correct relative to index.html
    try {
        const response = await fetch(url);
        if (!response.ok) { throw new Error(`HTTP error! status: ${response.status} loading ${url}`); }
        const data = await response.json();
        console.log("Data fetched successfully (size check):", data?.learning_items?.length || 'N/A', "items");

        // --- Data Transformation for Compound Nodes ---
        if (data.learning_items) {
            console.log("Transforming learning_items to elements array with compound parents...");
            const learningItems = data.learning_items;

            // 1. Find unique domains and sort them
            const uniqueDomains = [...new Set(learningItems.map(item => item.domain || 'Uncategorized'))].sort();
            console.log("Unique domains found:", uniqueDomains);

            // 2. Create Parent Nodes for domains
            const parentNodes = uniqueDomains.map((domainName, index) => ({
                data: {
                    id: `domain-${domainName.replace(/[^a-zA-Z0-9]/g, '-')}`, // Create a safe ID
                    name: domainName, // Store name for label
                    isParent: true, // Custom flag to identify parents easily
                    class: index % 2 === 0 ? 'domain-even' : 'domain-odd' // For alternating styles
                }
            }));
             console.log("Parent nodes created:", parentNodes.length);

            // 3. Create Child Nodes and assign parent
            const childNodes = learningItems.map(item => {
                const domainName = item.domain || 'Uncategorized';
                const parentId = `domain-${domainName.replace(/[^a-zA-Z0-9]/g, '-')}`;
                const { isParent, ...itemData } = item; // Remove isParent flag if present
                return {
                    data: {
                        ...itemData, // Spread original item data
                        parent: parentId // Assign parent ID
                    }
                };
            });
            console.log("Child nodes created:", childNodes.length);

            // 4. Create Edges
            const edges = [];
            childNodes.forEach(node => { // Iterate childNodes which have the full data object
                 if (node.data.prerequisites && Array.isArray(node.data.prerequisites)) { node.data.prerequisites.forEach(prereqId => { if (childNodes.some(n => n.data.id === prereqId)) { edges.push({ data: { id: `edge-prereq-${prereqId}-${node.data.id}`, source: prereqId, target: node.data.id, type: 'prerequisite' } }); } else { console.warn(`Prereq source node '${prereqId}' not found for target '${node.data.id}'.`); } }); }
                 if (node.data.maintenance_contribution_for && Array.isArray(node.data.maintenance_contribution_for)) { node.data.maintenance_contribution_for.forEach(targetCertId => { if (childNodes.some(n => n.data.id === targetCertId)) { edges.push({ data: { id: `edge-maint-${node.data.id}-${targetCertId}`, source: node.data.id, target: targetCertId, type: 'maintenance' } }); } else { console.warn(`Maint target node '${targetCertId}' not found for source '${node.data.id}'.`); } }); }
             });
             console.log("Edges created:", edges.length);

            // 5. Combine all elements into a flat array
            const elements = [...parentNodes, ...childNodes, ...edges];
            // RETURN elements AND the list of unique domains
            return { elements, uniqueDomains };

        } else {
             // Handle cases where data might already be in elements format
             console.warn("Data does not contain 'learning_items'. Cannot process domains reliably.");
             if (Array.isArray(data)) return { elements: data, uniqueDomains: [] };
             if (data.elements) return { elements: data.elements, uniqueDomains: [] };
             throw new Error("Invalid data format. Expected 'learning_items' array.");
         }

    } catch (error) {
        console.error("Could not fetch or process data:", error);
        return { elements: [], uniqueDomains: [] }; // Return empty structure on error
    }
}