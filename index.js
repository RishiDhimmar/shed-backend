

const express = require('express');
const fs = require('fs');
const DxfParser = require('dxf-parser');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors({ origin: '*' }));

// Use memory storage to avoid saving files to disk
const upload = multer({ storage: multer.memoryStorage() });

// Default endpoint - Reads from "Result.dxf" on disk
app.get('/api/dxf-entities', (req, res) => {
    const filePath = 'Result.dxf'; 

    try {
        const fileText = fs.readFileSync(filePath, 'utf-8');
        const parser = new DxfParser();
        const dxf = parser.parseSync(fileText);

        if (!dxf || !dxf.entities) {
            throw new Error('No entities found in DXF file');
        }

        res.json({ entities: dxf.entities });
    } catch (err) {
        console.error('Error parsing DXF:', err.message);
        res.status(500).json({ error: 'Failed to parse DXF file', details: err.message });
    }
});

// Upload DXF endpoint - Processes file in memory (does not store it)
app.post('/api/upload-dxf', upload.single('dxfFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const fileText = req.file.buffer.toString('utf-8'); // Read file from memory
        const parser = new DxfParser();
        const dxf = parser.parseSync(fileText);

        if (!dxf || !dxf.entities) {
            throw new Error('No entities found in uploaded DXF file');
        }

        res.json({ entities: dxf.entities });
    } catch (err) {
        console.error('Error parsing uploaded DXF:', err.message);
        res.status(500).json({ error: 'Failed to parse uploaded DXF file', details: err.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
