const { Colors, DxfWriter, LWPolylineFlags } = require('@tarikjabiri/dxf');
const { point3d } = require('@tarikjabiri/dxf');
const DxfParser = require('dxf-parser');
const fs = require('fs');

/**
 * Creates a linear dimension entity
 * 
 * @param {Object} dxf - DXF writer instance
 * @param {Array} start - first point [x, y]
 * @param {Array} end - second point [x, y]
 * @param {Number} offset - dimension offset distance
 * @param {String} layer - layer name for the dimension
 */
function createLinearDimension(dxf, start, end, offset = 100, layer = "Dimensions") {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const length = Math.sqrt(dx * dx + dy * dy).toFixed(2);

  const midX = (start[0] + end[0]) / 2;
  const midY = (start[1] + end[1]) / 2;

  const offsetX = dy !== 0 ? offset : 0;
  const offsetY = dx !== 0 ? offset : 0;

  const lineStart = [start[0] + offsetX, start[1] - offsetY - 1000];
  const lineEnd = [end[0] + offsetX, end[1] - offsetY - 1000];

  try {
    // Add dimension lines
    dxf.setCurrentLayerName('Dimensions')
    dxf.addLine(point3d(lineStart[0], lineStart[1]), point3d(lineEnd[0], lineEnd[1]), { layer: layer });
    // dxf.addLine(point3d(start[0], start[1]), point3d(lineStart[0], lineStart[1]), { layer: layer });
    // dxf.addLine(point3d(end[0], end[1]), point3d(lineEnd[0], lineEnd[1]), { layer: layer });

    // Add dimension text
    // Assuming there is a method like addText
    dxf.addText(
      point3d(midX + offsetX + 0.1, midY - offsetY - 1000),
      200, // text height
      length.toString(), // text content
      { layer } // options like layer, rotation, alignment, etc.
    );

  } catch (e) {
    console.error('Error creating dimension:', e.message);
  }
}

const getDxfEntitiesSampleFile = (req, res) => {
  const filePath = 'Result.dxf';

  try {
    const fileText = fs.readFileSync(filePath, 'utf-8');
    const parser = new DxfParser();
    const dxfResult = parser.parseSync(fileText);

    if (!dxfResult || !dxfResult.entities) {
      throw new Error('No entities found in DXF file');
    }

    res.json({ entities: dxfResult.entities });
  } catch (err) {
    console.error('Error parsing DXF:', err.message);
    res.status(500).json({ error: 'Failed to parse DXF file', details: err.message });
  }
};

const getDxfEntitiesFromFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  console.log('hit')

  try {
    const fileText = req.file.buffer.toString('utf-8');
    const parser = new DxfParser();
    const dxfResult = parser.parseSync(fileText);

    if (!dxfResult || !dxfResult.entities) {
      throw new Error('No entities found in uploaded DXF file');
    }

    res.json({ entities: dxfResult.entities });
  } catch (err) {
    console.error('Error parsing uploaded DXF:', err.message);
    res.status(500).json({ error: 'Failed to parse uploaded DXF file', details: err.message });
  }
};

const generateDxfFromJson = (req, res) => {
  const { basePlot, wall, baseplate, column, foundation, mullionColumn, groundBeam } = req.body;

  if (!Array.isArray(baseplate.basePlates)) {
    return res.status(400).json({ error: 'Invalid basePlates data' });
  }

  try {
    const dxf = new DxfWriter();

    //define layers
    dxf.addLayer('BasePlot', Colors.White, 'CONTINUOUS');
    dxf.addLayer('ExternalWall', Colors.Yellow, 'CONTINUOUS');
    dxf.addLayer('InternalWall', Colors.Yellow, 'CONTINUOUS');
    dxf.addLayer('BasePlates', Colors.Green, 'CONTINUOUS');
    dxf.addLayer('Columns', Colors.Blue, 'CONTINUOUS');
    dxf.addLayer('MullionColumn', Colors.Red, 'CONTINUOUS');
    dxf.addLayer('GroundBeam', Colors.Cyan, 'CONTINUOUS');
    dxf.addLayer('Foundation', Colors.Magenta, 'CONTINUOUS');
    dxf.addLayer('Dimensions', Colors.White, 'Dashed');

    const createPolylineFromPoints = (points, layer) => {
      try {
        if (!Array.isArray(points) || points.length < 2) return;

        const vertices = points.map(([x, y]) => ({
          point: point3d(x, y),
        }));

        dxf.setCurrentLayerName(layer);
        dxf.addLWPolyline(vertices, { flags: LWPolylineFlags.Closed }); // Assuming addLwPolyline exists and accepts vertices and options
      } catch (e) {
        console.error(`Error creating polyline on layer ${layer}:`, e.message);
      }
    };

    // Draw Base Plot
    createPolylineFromPoints(basePlot.points || [], 'BasePlot');

    // Draw External Wall
    createPolylineFromPoints(wall.externalWallPoints || [], 'ExternalWall');

    // Draw Internal Wall
    createPolylineFromPoints(wall.internalWallPoints || [], 'InternalWall');

    // Draw BasePlates
    baseplate.basePlates.forEach(plate => {
      if (Array.isArray(plate.points) && plate.points.length >= 2) {
        console.log(plate.points)
        createPolylineFromPoints(plate.points || [], 'BasePlates');
      }
    });

    // Draw Columns
    if (column && Array.isArray(column.columns)) {
      column.columns.forEach(col => {
        if (Array.isArray(col.points) && col.points.length >= 2) {
          createPolylineFromPoints(col.points || [], 'Columns');
        }
      });
    }

    // Draw Foundations
    if (foundation && Array.isArray(foundation.foundations)) {
      foundation.foundations.forEach(f => {
        if (Array.isArray(f.points) && f.points.length >= 2) {
          createPolylineFromPoints(f.points || [], 'Foundation');
        }
      });
    }

    // Draw Mullion Columns
    if (mullionColumn && Array.isArray(mullionColumn.mullionPositions)) {
      mullionColumn.mullionPositions.forEach(points => {
        if (Array.isArray(points) && points.length >= 2) {
          createPolylineFromPoints(points || [], 'MullionColumn');
        }
      });
    }

    // Draw Ground Beam
    if (groundBeam && Array.isArray(groundBeam.points)) {
      createPolylineFromPoints(groundBeam.points || [], 'GroundBeam');
    }

    // Debug test label at origin
    // try {
    //   dxf.addText('TEST LABEL', point3d(500, 0), { height: 1 }); // Assuming addText exists and accepts position and options
    // } catch (e) {
    //   console.error('Error creating test label:', e.message);
    // }

    // Example dimension for baseplates
    if (baseplate.basePlates.length > 0) {
      baseplate.basePlates.forEach((plate) => {
        if (plate.points && plate.points.length >= 2) {
          try {
            createLinearDimension(dxf, plate.points[0], plate.points[1], 5);
          } catch (e) {
            console.error('Error creating dimension:', e.message);
          }
        }
      });
    }

    // Generate DXF string
    // console.log(dxf.stringify)
    const dxfString = dxf.stringify();


    res.setHeader('Content-Disposition', 'attachment; filename="shed.dxf"');
    res.setHeader('Content-Type', 'application/dxf');
    res.send(dxfString);
  } catch (error) {
    console.error('DXF generation error:', error);
    res.status(500).json({ error: 'Failed to generate DXF', details: error.message || 'Unknown error' });
  }
};

const getSampleDxfFromJson = (req, res) => {
  const { baseplate } = req.body;

  if (!baseplate || !Array.isArray(baseplate.basePlates)) {
    return res.status(400).json({ error: 'Invalid baseplate data' });
  }

  try {
    const dxf = new DxfWriter();

    // Draw each baseplate
    baseplate.basePlates.forEach(plate => {
      if (Array.isArray(plate.points) && plate.points.length >= 2) {
        const vertices = plate.points.map(point => point3d(point[0], point[1]));
        dxf.addLWPolyline(vertices); // Assuming addLwPolyline exists and accepts vertices
      }
    });

    // Generate DXF string
    const dxfString = dxf.stringify();

    res.setHeader('Content-Disposition', 'attachment; filename="baseplates.dxf"');
    res.setHeader('Content-Type', 'application/dxf');
    res.send(dxfString);
  } catch (error) {
    console.error('DXF generation error:', error);
    res.status(500).json({ error: 'Failed to generate DXF', details: error.message || 'Unknown error' });
  }
};

const temp = (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="shed.dxf"');
  res.setHeader('Content-Type', 'application/dxf');
  res.send(req.body);
};

module.exports = { getDxfEntitiesSampleFile, getDxfEntitiesFromFile, generateDxfFromJson, getSampleDxfFromJson, temp };