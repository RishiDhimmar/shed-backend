const express = require('express');
const fs = require('fs');
const DxfParser = require('dxf-parser');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: '*'
}));

app.get('/api/dxf-entities', (req, res) => {
    const filePath = 'Result.dxf'; // Adjust to 'Result.dxf' if that’s your file

    try {
        const fileText = fs.readFileSync(filePath, 'utf-8');
        console.log('File content:', fileText); // Log the file content
        const parser = new DxfParser();
        const dxf = parser.parseSync(fileText);
        console.log('Parsed DXF:', dxf); // Log the parsed object

        if (!dxf || !dxf.entities) {
            throw new Error('No entities found in DXF file');
        }

        res.json({ entities: dxf.entities });
    } catch (err) {
        console.error('Error parsing DXF:', err.message); // Log specific error
        res.status(500).json({ error: 'Failed to parse DXF file', details: err.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});