const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

app.post('/api/update-node', async (req, res) => {
    try {
        const nodeData = req.body;
        const filePath = path.join(__dirname, 'data', 'sample-data.json');
        
        // Read current data
        const jsonData = JSON.parse(await fs.readFile(filePath, 'utf8'));
        
        // Update the specific node
        const nodeIndex = jsonData.learning_items.findIndex(item => item.id === nodeData.id);
        if (nodeIndex !== -1) {
            jsonData.learning_items[nodeIndex] = {
                ...jsonData.learning_items[nodeIndex],
                ...nodeData
            };
            
            // Write updated data back to file
            await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Node not found' });
        }
    } catch (error) {
        console.error('Error updating JSON:', error);
        res.status(500).json({ error: 'Failed to update data' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
