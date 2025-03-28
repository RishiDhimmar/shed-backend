const express = require('express');
const fs = require('fs');
const DxfParser = require('dxf-parser');

const app = express();

app.get('/api/dxf-entities', (req, res) => {
    const filePath = 'Result.dxf'; // Ensure this matches your file name

    try {
        const fileText = fs.readFileSync(filePath, 'utf-8');
        const parser = new DxfParser();
        const dxf = parser.parseSync(fileText);

        res.json({ entities: dxf.entities });
    } catch (err) {
        console.error('Error parsing DXF:', err);
        res.status(500).json({ error: 'Failed to parse DXF file' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});