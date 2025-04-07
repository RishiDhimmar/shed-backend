const express = require('express');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const DxfParser = require('dxf-parser');
const Drawing = require('dxf-writer');


const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json()); // Needed for parsing JSON in POST requests

// Use memory storage for uploaded files
const upload = multer({ storage: multer.memoryStorage() });

// Default endpoint - Reads a DXF file from disk and parses it
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

// Upload DXF file and parse it (does not save file)
app.post('/api/upload-dxf', upload.single('dxfFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const fileText = req.file.buffer.toString('utf-8');
        const parser = new DxfParser();
        const dxf = parser.parseSync(fileText);

        if (!dxf || !dxf.entities) {
            throw new Error('No entities found in uploaded DXF file');
        }

        console.log(dxf.entities);
        res.json({ entities: dxf.entities });
    } catch (err) {
        console.error('Error parsing uploaded DXF:', err.message);
        res.status(500).json({ error: 'Failed to parse uploaded DXF file', details: err.message });
    }
});

app.post('/api/generate-dxf', (req, res) => {
    const { basePlot, wall, baseplate, column, foundation, mullionColumn, groundBeam } = req.body;

    if (!Array.isArray(baseplate.basePlates)) {
        return res.status(400).json({ error: 'Invalid basePlates data' });
    }

    try {
        const d = new Drawing();
        d.setUnits('Meters');

        // Define layers with optional color numbers (ACI)
        d.addLayer('BasePlot', Drawing.ACI.GRAY, 'CONTINUOUS');
        d.addLayer('ExternalWall', Drawing.ACI.ORANGE, 'CONTINUOUS');
        d.addLayer('InternalWall', Drawing.ACI.ORANGE, 'CONTINUOUS');
        d.addLayer('BasePlates', Drawing.ACI.GREEN, 'CONTINUOUS');
        d.addLayer('Columns', Drawing.ACI.BLUE, 'CONTINUOUS');
        d.addLayer('Foundations', Drawing.ACI.MAGENTA, 'CONTINUOUS');
        d.addLayer('MullionColumns', Drawing.ACI.RED, 'CONTINUOUS');
        d.addLayer('GroundBeam', Drawing.ACI.CYAN, 'CONTINUOUS');

        // Base plot
        d.setActiveLayer('BasePlot');
        d.drawPolyline(basePlot.points, true);

        // Walls
        d.setActiveLayer('ExternalWall');
        d.drawPolyline(wall.externalWallPoints, true);

        d.setActiveLayer('InternalWall');
        d.drawPolyline(wall.internalWallPoints, true);

        // Base plates
        d.setActiveLayer('BasePlates');
        baseplate.basePlates.forEach((plate) => {
            if (Array.isArray(plate.points) && plate.points.length >= 2) {
                d.drawPolyline(plate.points, true);
            }
        });

        // Columns
        d.setActiveLayer('Columns');
        column.columns.forEach((col) => {
            if (Array.isArray(col.points) && col.points.length >= 2) {
                d.drawPolyline(col.points, true);
            }
        });

        // Foundations
        d.setActiveLayer('Foundations');
        foundation.foundations.forEach((f) => {
            if (Array.isArray(f.points) && f.points.length >= 2) {
                d.drawPolyline(f.points, true);
            }
        });

        // Mullion Columns
        d.setActiveLayer('MullionColumns');
        mullionColumn.mullionPositions.forEach((points) => {
            if (Array.isArray(points) && points.length >= 2) {
                d.drawPolyline(points, true);
            }
        });

        // Ground Beam
        d.setActiveLayer('GroundBeam');
        d.drawPolyline(groundBeam.points, true);

        const dxfString = d.toDxfString();

        res.setHeader('Content-Disposition', 'attachment; filename="shed.dxf"');
        res.setHeader('Content-Type', 'application/dxf');
        res.send(dxfString);
    } catch (error) {
        console.error('DXF generation error:', error.message);
        res.status(500).json({ error: 'Failed to generate DXF', details: error.message });
    }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
