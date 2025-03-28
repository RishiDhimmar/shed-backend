import express from 'express';
import fs from 'fs';
import cors from 'cors';
import DxfParser from 'dxf-parser';

const app = express();
app.use(cors()); // Enable CORS

// API Route for DXF Entities
app.get('/api/dxf-entities', (req, res) => {
    const filePath = 'sample.dxf'; // Make sure this file is in your project root

    try {
        const fileText = fs.readFileSync(filePath, 'utf-8');
        const parser = new DxfParser();
        const dxf = parser.parseSync(fileText);

        res.json({ entities: dxf.entities }); // Return only the entities
    } catch (err) {
        console.error('Error parsing DXF:', err);
        res.status(500).json({ error: 'Failed to parse DXF file' });
    }
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

export default app;
