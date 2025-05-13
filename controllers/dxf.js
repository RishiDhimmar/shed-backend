
// const { Colors, DxfWriter, LWPolylineFlags, TextHorizontalAlignment, TextVerticalAlignment, SolidFillFlag, HatchPolylineBoundary, HatchBoundaryPaths } = require('@tarikjabiri/dxf');
// const { point3d } = require('@tarikjabiri/dxf');
// const DxfParser = require('dxf-parser');
// const fs = require('fs');
// const { convertFlatPointsToVertices, initializeLayers, filterEveryThird, partitionGroupsByDimension } = require('../utils/dxfUtils');
// const enableDimensions = false;

// /**
//  * Creates a linear dimension entity
//  * 
//  * @param {Object} dxf - DXF writer instance
//  * @param {Array} start - first point [x, y]
//  * @param {Array} end - second point [x, y]
//  * @param {Number} offset - dimension offset distance
//  * @param {String} layer - layer name for the dimension
//  */
// function createLinearDimension(dxf, start, end, offset = 100, layer = "Dimensions") {
//   const dx = end[0] - start[0];
//   const dy = end[1] - start[1];
//   const length = Math.sqrt(dx * dx + dy * dy).toFixed(2);

//   const midX = (start[0] + end[0]) / 2;
//   const midY = (start[1] + end[1]) / 2;

//   const offsetX = dy !== 0 ? offset : 0;
//   const offsetY = dx !== 0 ? offset : 0;

//   const lineStart = [start[0] + offsetX, start[1] - offsetY - 1000];
//   const lineEnd = [end[0] + offsetX, end[1] - offsetY - 1000];

//   try {
//     // Add dimension lines
//     dxf.setCurrentLayerName('Dimensions')
//     dxf.addLine(point3d(lineStart[0], lineStart[1]), point3d(lineEnd[0], lineEnd[1]), { layer: layer });
//     // dxf.addLine(point3d(start[0], start[1]), point3d(lineStart[0], lineStart[1]), { layer: layer });
//     // dxf.addLine(point3d(end[0], end[1]), point3d(lineEnd[0], lineEnd[1]), { layer: layer });

//     // Add dimension text
//     // Assuming there is a method like addText
//     dxf.addText(
//       point3d(midX + offsetX + 0.1, midY - offsetY - 1000),
//       200, // text height
//       length.toString(), // text content
//       { layer } // options like layer, rotation, alignment, etc.
//     );

//   } catch (e) {
//     console.error('Error creating dimension:', e.message);
//   }
// }

// const getDxfEntitiesSampleFile = (req, res) => {
//   const filePath = 'Result.dxf';

//   try {
//     const fileText = fs.readFileSync(filePath, 'utf-8');
//     const parser = new DxfParser();
//     const dxfResult = parser.parseSync(fileText);

//     if (!dxfResult || !dxfResult.entities) {
//       throw new Error('No entities found in DXF file');
//     }

//     res.json({
//       entities: filteredEntities,
//       blocks: dxfResult.blocks || {},
//     });
//   } catch (err) {
//     console.error('Error parsing DXF:', err.message);
//     res.status(500).json({ error: 'Failed to parse DXF file', details: err.message });
//   }
// };

// const getDxfEntitiesFromFile = (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'No file uploaded' });
//   }

//   try {
//     const { layerName } = req.body;
//     const fileText = req.file.buffer.toString('utf-8');
//     const parser = new DxfParser();
//     const dxfResult = parser.parseSync(fileText);

//     if (!dxfResult || !dxfResult.entities) {
//       throw new Error('No entities found in uploaded DXF file');
//     }

//     let filteredEntities = dxfResult.entities;

//     if (layerName) {
//       filteredEntities = filteredEntities.filter(entity => entity.layer.toLowerCase() === layerName.toLowerCase());
//       // filteredEntities = filteredEntities.filter(entity => entity.layer === layerName);
//     }

//     res.json({
//       entities: filteredEntities,
//       blocks: dxfResult.blocks || {},
//     });

//   } catch (err) {
//     console.error('Error parsing uploaded DXF:', err.message);
//     res.status(500).json({ error: 'Failed to parse uploaded DXF file', details: err.message });
//   }
// };

// const generateDxfFromJson = (req, res) => {
//   const {
//     basePlot = {},
//     wall = {},
//     baseplate = { basePlates: [] },
//     column = { columns: [] },
//     foundation = { foundations: [] },
//     mullionColumn = { mullionPositions: [] },
//     groundBeam = { points: [] },
//   } = req.body;

//   try {
//     const dxf = new DxfWriter();

//     // Define layers
//     dxf.addLayer('BasePlot', Colors.White, 'CONTINUOUS');
//     dxf.addLayer('ExternalWall', Colors.Yellow, 'CONTINUOUS');
//     dxf.addLayer('InternalWall', Colors.Yellow, 'CONTINUOUS');
//     dxf.addLayer('BasePlates', Colors.Green, 'CONTINUOUS');
//     dxf.addLayer('Columns', Colors.Blue, 'CONTINUOUS');
//     dxf.addLayer('MullionColumn', Colors.Red, 'CONTINUOUS');
//     dxf.addLayer('GroundBeam', Colors.Cyan, 'CONTINUOUS');
//     dxf.addLayer('Foundation', Colors.Magenta, 'CONTINUOUS');
//     dxf.addLayer('Dimensions', Colors.White, 'Dashed');
//     dxf.addLayer('Centerline', Colors.Green, 'DASHED');

//     const createPolylineFromPoints = (points, layer) => {
//       try {
//         if (!Array.isArray(points)) return;

//         const vertices = points.map(([x, y]) => ({
//           point: point3d(x, y),
//         }));

//         dxf.setCurrentLayerName(layer);
//         dxf.addLWPolyline(vertices, { flags: LWPolylineFlags.Closed });
//       } catch (e) {
//         console.error(`Error creating polyline on layer ${layer}:`, e.message);
//       }
//     };

//     // Helper: Try drawing dimension between 2 points
//     const tryAddDimension = (a, b, offset) => {
//       try {
//         if (Array.isArray(a) && Array.isArray(b)) {
//           createLinearDimension(dxf, a, b, offset);
//         }
//       } catch (e) {
//         console.error('Error creating dimension:', e.message);
//       }
//     };

//     // BasePlot
//     if (Array.isArray(basePlot.points)) {
//       createPolylineFromPoints(basePlot.points, 'BasePlot');
//     }

//     // External Walls
//     if (Array.isArray(wall.externalWallPoints)) {
//       createPolylineFromPoints(wall.externalWallPoints, 'ExternalWall');
//     }

//     // Internal Walls
//     if (Array.isArray(wall.internalWallPoints)) {
//       createPolylineFromPoints(wall.internalWallPoints, 'InternalWall');
//     }

//     // Baseplates
//     baseplate.basePlates?.forEach((plate) => {
//       if (Array.isArray(plate.points)) {
//         createPolylineFromPoints(plate.points, 'BasePlates');
//         // createPolylineFromPoints(plate.centerLinePoints.horizontal, 'Centerline');
//         // createPolylineFromPoints(plate.centerLinePoints.vertical, 'Centerline');

//         // Optional dimension
//         // if (plate.points.length >= 2) {
//         //   tryAddDimension(plate.points[0], plate.points[1], 5);
//         // }
//       }
//     });

//     // Columns
//     column.columns?.forEach((col) => {
//       if (Array.isArray(col.points)) {
//         createPolylineFromPoints(col.points, 'Columns');
//         // Optional dimensions...
//         // if (col.points.length >= 2) tryAddDimension(col.points[0], col.points[1], 5);
//       }
//     });

//     // Foundations
//     foundation.foundations?.forEach((f) => {
//       if (Array.isArray(f.points)) {
//         createPolylineFromPoints(f.points, 'Foundation');
//         // Optional dimensions...
//       }
//     });

//     // Mullion Columns
//     mullionColumn.mullionPositions?.forEach((points) => {
//       if (Array.isArray(points)) {
//         createPolylineFromPoints(points, 'MullionColumn');
//       }
//     });

//     // Ground Beam
//     if (Array.isArray(groundBeam.points)) {
//       createPolylineFromPoints(groundBeam.points, 'GroundBeam');
//     }

//     // DXF Output
//     const dxfString = dxf.stringify();
//     res.setHeader('Content-Disposition', 'attachment; filename="shed.dxf"');
//     res.setHeader('Content-Type', 'application/dxf');
//     res.send(dxfString);
//   } catch (error) {
//     console.error('DXF generation error:', error);
//     res.status(500).json({
//       error: 'Failed to generate DXF',
//       details: error.message || 'Unknown error',
//     });
//   }
// };


// const getSampleDxfFromJson = (req, res) => {
//   const { baseplate } = req.body;

//   if (!baseplate || !Array.isArray(baseplate.basePlates)) {
//     return res.status(400).json({ error: 'Invalid baseplate data' });
//   }

//   try {
//     const dxf = new DxfWriter();

//     // Draw each baseplate
//     baseplate.basePlates.forEach(plate => {
//       if (Array.isArray(plate.points) && plate.points.length >= 2) {
//         const vertices = plate.points.map(point => point3d(point[0], point[1]));
//         dxf.addLWPolyline(vertices); // Assuming addLwPolyline exists and accepts vertices
//       }
//     });

//     // Generate DXF string
//     const dxfString = dxf.stringify();

//     res.setHeader('Content-Disposition', 'attachment; filename="baseplates.dxf"');
//     res.setHeader('Content-Type', 'application/dxf');
//     res.send(dxfString);
//   } catch (error) {
//     console.error('DXF generation error:', error);
//     res.status(500).json({ error: 'Failed to generate DXF', details: error.message || 'Unknown error' });
//   }
// };

// // Helper functions to reduce code duplication
// function addPolyline(dxf, points, layerName) {
//   dxf.setCurrentLayerName(layerName);
//   const vertices = points.map(point => ({ point: point3d(point.x, -point.y) }));
//   dxf.addLWPolyline(vertices, { flags: 1 });
// }

// function addLine(dxf, start, end, layerName) {
//   dxf.setCurrentLayerName(layerName);
//   dxf.addLine(point3d(start.x, -start.y), point3d(end.x, -end.y));
// }

// function addCircle(dxf, center, radius, layerName) {
//   dxf.setCurrentLayerName(layerName);
//   dxf.addCircle(point3d(center.x, -center.y), radius);
// }

// // New function to add dimension lines for a polygon
// function addDimensionLines(dxf, points, layerName, offset = 500) {

//   if (!points || points.length < 2 || !enableDimensions) return;

//   dxf.setCurrentLayerName('Dimensions');

//   // For each edge in the polygon
//   for (let i = 1; i < 3; i++) {
//     const start = points[i];
//     const end = points[(i + 1) % points.length];

//     // Skip if the points are the same
//     if (start.x === end.x && start.y === end.y) continue;

//     // Calculate direction vector of the edge
//     const dx = end.x - start.x;
//     const dy = end.y - start.y;
//     const length = Math.sqrt(dx * dx + dy * dy);

//     // Calculate perpendicular direction for offset
//     const perpX = -dy / length;
//     const perpY = dx / length;

//     // Offset points
//     const startOffset = {
//       x: start.x + perpX * offset,
//       y: start.y + perpY * offset
//     };

//     const endOffset = {
//       x: end.x + perpX * offset,
//       y: end.y + perpY * offset
//     };

//     // Draw dimension line
//     addLine(dxf, startOffset, endOffset, layerName + '_Dimension');

//     // Draw extension lines
//     addLine(dxf, start, startOffset, layerName + '_Dimension');
//     addLine(dxf, end, endOffset, layerName + '_Dimension');

//     // Add dimension text (length of the edge)
//     const midpoint = {
//       x: (startOffset.x + endOffset.x) / 2,
//       y: (startOffset.y + endOffset.y) / 2
//     };

//     const dimensionText = Math.round(length).toString();
//     dxf.setCurrentLayerName('Dimensions');
//     dxf.addText(point3d(midpoint.x, -midpoint.y), 100, dimensionText);
//   }
//   dxf.setCurrentLayerName(layerName);
// }

// // Modular functions for each data type
// function addDxfData(dxf, dxfData) {
//   if (!dxfData.data) return;
//   dxf.setCurrentLayerName('DxfData');
//   // Add polygons
//   if (Array.isArray(dxfData.data.polygons)) {
//     dxfData.data.polygons.forEach(points => {
//       if (Array.isArray(points) && points.length >= 2) {
//         addPolyline(dxf, points, 'DxfData');
//       }
//     });
//   }
//   // Add lines
//   if (Array.isArray(dxfData.data.lines)) {
//     dxfData.data.lines.forEach(line => {
//       if (line.start && line.end) {
//         addLine(dxf, line.start, line.end, 'DxfData');
//       }
//     });
//   }
//   // Add curves (circles)
//   if (Array.isArray(dxfData.data.curves)) {
//     dxfData.data.curves.forEach(curve => {
//       if (curve.type === 'CIRCLE' && curve.center && typeof curve.radius === 'number') {
//         addCircle(dxf, curve.center, curve.radius, 'DxfData');
//         // Add dimension lines for circle (diameter)
//       }
//     });
//     // Text addition remains commented out due to potential issues
//     // if (Array.isArray(dxfData.data.texts)) {
//     //   dxfData.data.texts.forEach(text => {
//     //     if (text.text && typeof text.text === 'string' && text.text.trim()) {
//     //       addText(dxf, text, 'DxfData');
//     //     }
//     //   });
//     // }
//   }
// }

// function addExternalWall(dxf, wall) {
//   dxf.setCurrentLayerName('ExternalWall');
//   if (Array.isArray(wall.externalWallPoints) && Array.isArray(wall.internalWallPoints)) {
//     const externalVertices = convertFlatPointsToVertices(wall.externalWallPoints);
//     addDimensionLines(dxf, wall.externalWallPoints.map(p => ({ x: p.x, y: p.y })), 'ExternalWall', 700);
//     dxf.addLWPolyline(externalVertices, { flags: 1 });
//     // Add dimension lines for external wall

//     const filteredInnerPoints = filterEveryThird(wall.internalWallPoints);
//     const internalVertices = convertFlatPointsToVertices(filteredInnerPoints);

//     addDimensionLines(dxf, filteredInnerPoints.map(p => ({ x: p.x, y: p.y })), 'ExternalWall', 900);
//     dxf.addLWPolyline(internalVertices, { flags: 1 });
//     // Add dimension lines for internal wall
//   }
// }

// function addBasePlates(dxf, baseplate) {
//   dxf.setCurrentLayerName('BasePlates');
//   if (Array.isArray(baseplate.basePlates)) {
//     baseplate.basePlates.forEach(plate => {
//       if (Array.isArray(plate.points) && plate.points.length >= 2) {
//         addDimensionLines(dxf, plate.points, 'BasePlates', 900);
//         addPolyline(dxf, plate.points, 'BasePlates');
//         // Add dimension lines for baseplate
//       }
//       dxf.addText(point3d(plate.points[0].x - 100, -plate.points[0].y), 200, plate.label);
//     });
//   }
// }

// function addColumns(dxf, column) {
//   dxf.setCurrentLayerName('Columns');
//   partitionGroupsByDimension(column.polygons).map((group, index) => group.map(p => { console.log(p.label + " " + index) }));

//   if (Array.isArray(column.columns)) {
//     column.columns.forEach(col => {
//       if (Array.isArray(col.points) && col.points.length >= 2) {
//         let transformedPoints = col.points.map(point => ({ x: point.x, y: -point.y }));
//         // Ensure polyline is closed
//         if (transformedPoints.length > 0) {
//           const first = transformedPoints[0];
//           const last = transformedPoints[transformedPoints.length - 1];
//           if (!(first.x === last.x && first.y === last.y)) {
//             transformedPoints.push({ x: first.x, y: first.y });
//           }
//         }
//         const polylineVertices = transformedPoints.map(point => ({ point: point3d(point.x, point.y) }));
//         addDimensionLines(dxf, col.points, 'Columns', 1000);
//         dxf.addLWPolyline(polylineVertices, { flags: 1 });
//         // Add dimension lines for columns
//         dxf.addText(point3d(col.points[0].x - 1500, -col.points[0].y), 200, col.label);
//       }
//     });
//   }
// }

// function addFoundations(dxf, foundation) {
//   dxf.setCurrentLayerName('Foundation');
//   if (Array.isArray(foundation.foundations)) {
//     foundation.foundations.forEach(plate => {
//       if (Array.isArray(plate.innerFoundationPoints) && plate.innerFoundationPoints.length >= 2) {
//         addDimensionLines(dxf, plate.innerFoundationPoints, 'Foundation', 1500);
//         addPolyline(dxf, plate.innerFoundationPoints, 'Foundation');
//         // Add dimension lines for inner foundation
//       }
//       if (Array.isArray(plate.outerFoundationPoints) && plate.outerFoundationPoints.length >= 2) {
//         addDimensionLines(dxf, plate.outerFoundationPoints, 'Foundation', 1600);
//         addPolyline(dxf, plate.outerFoundationPoints, 'Foundation');
//         // Add dimension lines for outer foundation
//       }
//       if (Array.isArray(plate.ppcPoints) && plate.ppcPoints.length >= 2) {
//         addDimensionLines(dxf, plate.ppcPoints, 'Foundation', 1700);
//         addPolyline(dxf, plate.ppcPoints, 'Foundation');
//         // Add dimension lines for ppc points
//       }
//       // Add lines between inner and outer foundations
//       if (
//         Array.isArray(plate.innerFoundationPoints) &&
//         Array.isArray(plate.outerFoundationPoints) &&
//         plate.innerFoundationPoints.length >= 4 &&
//         plate.outerFoundationPoints.length >= 4
//       ) {
//         [0, 1, 2, 3].forEach(i => {
//           addLine(dxf, plate.innerFoundationPoints[i], plate.outerFoundationPoints[i], 'Foundation');
//         });
//       }

//       dxf.addText(point3d(plate.innerFoundationPoints[0].x - 1000, -plate.innerFoundationPoints[0].y), 200, plate.label);
//     });
//   }
// }

// function addMullionColumns(dxf, mullionColumn) {
//   dxf.setCurrentLayerName('MullionColumn');
//   if (Array.isArray(mullionColumn.polygons)) {
//     mullionColumn.polygons.forEach(plate => {
//       if (Array.isArray(plate.points) && plate.points.length >= 2) {
//         addDimensionLines(dxf, plate.points, 'MullionColumn', 350);
//         addPolyline(dxf, plate.points, 'MullionColumn');
//         // Add dimension lines for mullion columns
//       }
//     });
//   }
// }


// // Main function
// const getDxfformPolygons = (req, res) => {
//   const {
//     wall = {},
//     baseplate = { basePlates: [] },
//     column = { columns: [] },
//     foundation = { foundations: [] },
//     mullionColumn = { mullionPositions: [] },
//     dxfData = {},
//   } = req.body;

//   try {
//     const dxf = new DxfWriter();
//     initializeLayers(dxf, Colors);

//     addDxfData(dxf, dxfData);
//     addExternalWall(dxf, wall);
//     addBasePlates(dxf, baseplate);
//     addColumns(dxf, column);
//     addFoundations(dxf, foundation);
//     addMullionColumns(dxf, mullionColumn);

//     const dxfString = dxf.stringify();
//     res.setHeader('Content-Disposition', 'attachment; filename="shed.dxf"');
//     res.setHeader('Content-Type', 'application/dxf');
//     res.send(dxfString);
//   } catch (error) {
//     console.error('DXF generation error:', error);
//     res.status(500).json({
//       error: 'Failed to generate DXF',
//       details: error.message || 'Unknown error',
//     });
//   }
// };


// const temp = (req, res) => {
//   res.setHeader('Content-Disposition', 'attachment; filename="shed.dxf"');
//   res.setHeader('Content-Type', 'application/dxf');
//   res.send(req.body);
// };

// module.exports = { getDxfEntitiesSampleFile, getDxfEntitiesFromFile, generateDxfFromJson, getSampleDxfFromJson, temp, getDxfformPolygons };

const { Colors, DxfWriter, LWPolylineFlags, TextHorizontalAlignment, TextVerticalAlignment, SolidFillFlag, HatchPolylineBoundary, HatchBoundaryPaths } = require('@tarikjabiri/dxf');
const { point3d } = require('@tarikjabiri/dxf');
const DxfParser = require('dxf-parser');
const fs = require('fs');
const { convertFlatPointsToVertices, initializeLayers, filterEveryThird, partitionGroupsByDimension, getBounds } = require('../utils/dxfUtils');
const enableDimensions = false;

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

    res.json({
      entities: filteredEntities,
      blocks: dxfResult.blocks || {},
    });
  } catch (err) {
    console.error('Error parsing DXF:', err.message);
    res.status(500).json({ error: 'Failed to parse DXF file', details: err.message });
  }
};

const getDxfEntitiesFromFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const { layerName } = req.body;
    const fileText = req.file.buffer.toString('utf-8');
    const parser = new DxfParser();
    const dxfResult = parser.parseSync(fileText);

    if (!dxfResult || !dxfResult.entities) {
      throw new Error('No entities found in uploaded DXF file');
    }

    let filteredEntities = dxfResult.entities;

    if (layerName) {
      filteredEntities = filteredEntities.filter(entity => entity.layer.toLowerCase() === layerName.toLowerCase());
      // filteredEntities = filteredEntities.filter(entity => entity.layer === layerName);
    }

    res.json({
      entities: filteredEntities,
      blocks: dxfResult.blocks || {},
    });

  } catch (err) {
    console.error('Error parsing uploaded DXF:', err.message);
    res.status(500).json({ error: 'Failed to parse uploaded DXF file', details: err.message });
  }
};

const generateDxfFromJson = (req, res) => {
  const {
    basePlot = {},
    wall = {},
    baseplate = { basePlates: [] },
    column = { columns: [] },
    foundation = { foundations: [] },
    mullionColumn = { mullionPositions: [] },
    groundBeam = { points: [] },
  } = req.body;

  try {
    const dxf = new DxfWriter();

    // Define layers
    dxf.addLayer('BasePlot', Colors.White, 'CONTINUOUS');
    dxf.addLayer('ExternalWall', Colors.Yellow, 'CONTINUOUS');
    dxf.addLayer('InternalWall', Colors.Yellow, 'CONTINUOUS');
    dxf.addLayer('BasePlates', Colors.Green, 'CONTINUOUS');
    dxf.addLayer('Columns', Colors.Blue, 'CONTINUOUS');
    dxf.addLayer('MullionColumn', Colors.Red, 'CONTINUOUS');
    dxf.addLayer('GroundBeam', Colors.Cyan, 'CONTINUOUS');
    dxf.addLayer('Foundation', Colors.Magenta, 'CONTINUOUS');
    dxf.addLayer('Dimensions', Colors.White, 'Dashed');
    dxf.addLayer('Centerline', Colors.Green, 'DASHED');

    const createPolylineFromPoints = (points, layer) => {
      try {
        if (!Array.isArray(points)) return;

        const vertices = points.map(([x, y]) => ({
          point: point3d(x, y),
        }));

        dxf.setCurrentLayerName(layer);
        dxf.addLWPolyline(vertices, { flags: LWPolylineFlags.Closed });
      } catch (e) {
        console.error(`Error creating polyline on layer ${layer}:`, e.message);
      }
    };

    // Helper: Try drawing dimension between 2 points
    const tryAddDimension = (a, b, offset) => {
      try {
        if (Array.isArray(a) && Array.isArray(b)) {
          createLinearDimension(dxf, a, b, offset);
        }
      } catch (e) {
        console.error('Error creating dimension:', e.message);
      }
    };

    // BasePlot
    if (Array.isArray(basePlot.points)) {
      createPolylineFromPoints(basePlot.points, 'BasePlot');
    }

    // External Walls
    if (Array.isArray(wall.externalWallPoints)) {
      createPolylineFromPoints(wall.externalWallPoints, 'ExternalWall');
    }

    // Internal Walls
    if (Array.isArray(wall.internalWallPoints)) {
      createPolylineFromPoints(wall.internalWallPoints, 'InternalWall');
    }

    // Baseplates
    baseplate.basePlates?.forEach((plate) => {
      if (Array.isArray(plate.points)) {
        createPolylineFromPoints(plate.points, 'BasePlates');
        // createPolylineFromPoints(plate.centerLinePoints.horizontal, 'Centerline');
        // createPolylineFromPoints(plate.centerLinePoints.vertical, 'Centerline');

        // Optional dimension
        // if (plate.points.length >= 2) {
        //   tryAddDimension(plate.points[0], plate.points[1], 5);
        // }
      }
    });

    // Columns
    column.columns?.forEach((col) => {
      if (Array.isArray(col.points)) {
        createPolylineFromPoints(col.points, 'Columns');
        // Optional dimensions...
        // if (col.points.length >= 2) tryAddDimension(col.points[0], col.points[1], 5);
      }
    });

    // Foundations
    foundation.foundations?.forEach((f) => {
      if (Array.isArray(f.points)) {
        createPolylineFromPoints(f.points, 'Foundation');
        // Optional dimensions...
      }
    });

    // Mullion Columns
    mullionColumn.mullionPositions?.forEach((points) => {
      if (Array.isArray(points)) {
        createPolylineFromPoints(points, 'MullionColumn');
      }
    });

    // Ground Beam
    if (Array.isArray(groundBeam.points)) {
      createPolylineFromPoints(groundBeam.points, 'GroundBeam');
    }

    // DXF Output
    const dxfString = dxf.stringify();
    res.setHeader('Content-Disposition', 'attachment; filename="shed.dxf"');
    res.setHeader('Content-Type', 'application/dxf');
    res.send(dxfString);
  } catch (error) {
    console.error('DXF generation error:', error);
    res.status(500).json({
      error: 'Failed to generate DXF',
      details: error.message || 'Unknown error',
    });
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
function createTable(dxf, x, y, rowHeight, colWidths, data, layer = "Table") {
  try {
    dxf.setCurrentLayerName(layer);

    const rows = data.length;
    const cols = colWidths.length;

    // Calculate total width and height of the table
    // Slight adjustment factor to nudge text to the left (tweak if needed)
    const centerOffsetCorrection = 10;

    // Adjust column widths: add padding per column
    const adjustedColWidths = colWidths.map(width => width + 20); // Add 20 units buffer
    const totalWidth = adjustedColWidths.reduce((sum, width) => sum + width, 0);

    const totalHeight = rows * rowHeight;

    // Draw outer rectangle
    dxf.addLine(point3d(x, y), point3d(x + totalWidth, y), { layer });
    dxf.addLine(point3d(x + totalWidth, y), point3d(x + totalWidth, y - totalHeight), { layer });
    dxf.addLine(point3d(x + totalWidth, y - totalHeight), point3d(x, y - totalHeight), { layer });
    dxf.addLine(point3d(x, y - totalHeight), point3d(x, y), { layer });


    // Draw horizontal lines (row separators)
    for (let i = 1; i < rows; i++) {
      const yPos = y - i * rowHeight;
      dxf.addLine(point3d(x, yPos), point3d(x + totalWidth, yPos), { layer });
    }


    // Draw vertical lines (column separators)
    let xPos = x;
    for (let i = 1; i < cols; i++) {
      xPos += colWidths[i - 1];
      dxf.addLine(point3d(xPos, y), point3d(xPos, y - totalHeight), { layer });
    }



    // Add text content
    let startY = y;

    // For each row
    for (let row = 0; row < rows; row++) {
      let startX = x;

      // For each column in the row
      for (let col = 0; col < cols; col++) {
        const cellText = data[row][col] || '';
        const cellWidth = adjustedColWidths[col];

        // Put text at a fixed offset from the top-left of the cell
        const textX = startX + (cellWidth / 4) - centerOffsetCorrection;
        const textY = startY - (row * rowHeight) - (rowHeight / 2);

        // Add text
        dxf.addText(
          point3d(textX, textY),
          rowHeight * 0.25, // Text height 25% of row height
          cellText,
          {
            layer,
            align: 'CENTER',
            valign: 'MIDDLE'
          }
        );

        startX += cellWidth;
      }
    }
  } catch (e) {
    console.error('Error creating table:', e.message);
  }
}
// Helper functions to reduce code duplication
function addPolyline(dxf, points, layerName) {
  dxf.setCurrentLayerName(layerName);
  const vertices = points.map(point => ({ point: point3d(point.x, -point.y) }));
  dxf.addLWPolyline(vertices, { flags: 1 });
}

function addLine(dxf, start, end, layerName) {
  dxf.setCurrentLayerName(layerName);
  dxf.addLine(point3d(start.x, -start.y), point3d(end.x, -end.y));
}

function addCircle(dxf, center, radius, layerName) {
  dxf.setCurrentLayerName(layerName);
  dxf.addCircle(point3d(center.x, -center.y), radius);
}

// New function to add dimension lines for a polygon
function addDimensionLines(dxf, points, layerName, offset = 500) {

  if (!points || points.length < 2 || !enableDimensions) return;

  dxf.setCurrentLayerName('Dimensions');

  // For each edge in the polygon
  for (let i = 1; i < 3; i++) {
    const start = points[i];
    const end = points[(i + 1) % points.length];

    // Skip if the points are the same
    if (start.x === end.x && start.y === end.y) continue;

    // Calculate direction vector of the edge
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    // Calculate perpendicular direction for offset
    const perpX = -dy / length;
    const perpY = dx / length;

    // Offset points
    const startOffset = {
      x: start.x + perpX * offset,
      y: start.y + perpY * offset
    };

    const endOffset = {
      x: end.x + perpX * offset,
      y: end.y + perpY * offset
    };

    // Draw dimension line
    addLine(dxf, startOffset, endOffset, layerName + '_Dimension');

    // Draw extension lines
    addLine(dxf, start, startOffset, layerName + '_Dimension');
    addLine(dxf, end, endOffset, layerName + '_Dimension');

    // Add dimension text (length of the edge)
    const midpoint = {
      x: (startOffset.x + endOffset.x) / 2,
      y: (startOffset.y + endOffset.y) / 2
    };

    const dimensionText = Math.round(length).toString();
    dxf.setCurrentLayerName('Dimensions');
    dxf.addText(point3d(midpoint.x, -midpoint.y), 100, dimensionText);
  }
  dxf.setCurrentLayerName(layerName);
}

// Modular functions for each data type
function addDxfData(dxf, dxfData) {
  if (!dxfData.data) return;
  dxf.setCurrentLayerName('DxfData');
  // Add polygons
  if (dxfData.data.polygons && Array.isArray(dxfData.data.polygons)) {
    dxfData.data.polygons.forEach(points => {
      if (Array.isArray(points) && points.length >= 2) {
        addPolyline(dxf, points, 'DxfData');
      }
    });
  }
  // Add lines
  if (dxfData.data.lines && Array.isArray(dxfData.data.lines)) {
    dxfData.data.lines.forEach(line => {
      if (line.start && line.end) {
        addLine(dxf, line.start, line.end, 'DxfData');
      }
    });
  }
  // Add curves (circles)
  if (dxfData.data.curves && Array.isArray(dxfData.data.curves)) {
    dxfData.data.curves.forEach(curve => {
      if (curve.type === 'CIRCLE' && curve.center && typeof curve.radius === 'number') {
        addCircle(dxf, curve.center, curve.radius, 'DxfData');
        // Add dimension lines for circle (diameter)
      }
    });
    // Text addition remains commented out due to potential issues
    // if (Array.isArray(dxfData.data.texts)) {
    //   dxfData.data.texts.forEach(text => {
    //     if (text.text && typeof text.text === 'string' && text.text.trim()) {
    //       addText(dxf, text, 'DxfData');
    //     }
    //   });
    // }
  }
}

function addExternalWall(dxf, wall) {
  dxf.setCurrentLayerName('ExternalWall');
  if (Array.isArray(wall.externalWallPoints) && Array.isArray(wall.internalWallPoints)) {
    const externalVertices = convertFlatPointsToVertices(wall.externalWallPoints);
    addDimensionLines(dxf, wall.externalWallPoints.map(p => ({ x: p.x, y: p.y })), 'ExternalWall', 700);
    dxf.addLWPolyline(externalVertices, { flags: 1 });
    // Add dimension lines for external wall

    const filteredInnerPoints = filterEveryThird(wall.internalWallPoints);
    const internalVertices = convertFlatPointsToVertices(filteredInnerPoints);

    addDimensionLines(dxf, filteredInnerPoints.map(p => ({ x: p.x, y: p.y })), 'ExternalWall', 900);
    dxf.addLWPolyline(internalVertices, { flags: 1 });
    // Add dimension lines for internal wall
  }
}

function addBasePlates(dxf, baseplate) {
  dxf.setCurrentLayerName('BasePlates');
  if (Array.isArray(baseplate.basePlates)) {
    baseplate.basePlates.forEach(plate => {
      if (Array.isArray(plate.points) && plate.points.length >= 2) {
        addDimensionLines(dxf, plate.points, 'BasePlates', 900);
        addPolyline(dxf, plate.points, 'BasePlates');
        // Add dimension lines for baseplate
      }
      dxf.addText(point3d(plate.points[0].x - 100, -plate.points[0].y), 200, plate.label);
    });
  }
}

function addColumns(dxf, column) {
  dxf.setCurrentLayerName('Columns');

  if (Array.isArray(column.columns)) {
    column.columns.forEach(col => {
      if (Array.isArray(col.points) && col.points.length >= 2) {
        let transformedPoints = col.points.map(point => ({ x: point.x, y: -point.y }));
        // Ensure polyline is closed
        if (transformedPoints.length > 0) {
          const first = transformedPoints[0];
          const last = transformedPoints[transformedPoints.length - 1];
          if (!(first.x === last.x && first.y === last.y)) {
            transformedPoints.push({ x: first.x, y: first.y });
          }
        }
        const polylineVertices = transformedPoints.map(point => ({ point: point3d(point.x, point.y) }));
        addDimensionLines(dxf, col.points, 'Columns', 1000);
        dxf.addLWPolyline(polylineVertices, { flags: 1 });
        // Add dimension lines for columns
        dxf.addText(point3d(col.points[0].x - 1500, -col.points[0].y), 200, col.label);
      }
    });
  }
}

function addFoundations(dxf, foundation) {
  dxf.setCurrentLayerName('Foundation');
  if (Array.isArray(foundation.foundations)) {
    foundation.foundations.forEach(plate => {
      if (Array.isArray(plate.innerFoundationPoints) && plate.innerFoundationPoints.length >= 2) {
        addDimensionLines(dxf, plate.innerFoundationPoints, 'Foundation', 1500);
        addPolyline(dxf, plate.innerFoundationPoints, 'Foundation');
        // Add dimension lines for inner foundation
      }
      if (Array.isArray(plate.outerFoundationPoints) && plate.outerFoundationPoints.length >= 2) {
        addDimensionLines(dxf, plate.outerFoundationPoints, 'Foundation', 1600);
        addPolyline(dxf, plate.outerFoundationPoints, 'Foundation');
        // Add dimension lines for outer foundation
      }
      if (Array.isArray(plate.ppcPoints) && plate.ppcPoints.length >= 2) {
        addDimensionLines(dxf, plate.ppcPoints, 'Foundation', 1700);
        addPolyline(dxf, plate.ppcPoints, 'Foundation');
        // Add dimension lines for ppc points
      }
      // Add lines between inner and outer foundations
      if (
        Array.isArray(plate.innerFoundationPoints) &&
        Array.isArray(plate.outerFoundationPoints) &&
        plate.innerFoundationPoints.length >= 4 &&
        plate.outerFoundationPoints.length >= 4
      ) {
        [0, 1, 2, 3].forEach(i => {
          addLine(dxf, plate.innerFoundationPoints[i], plate.outerFoundationPoints[i], 'Foundation');
        });
      }

      dxf.addText(point3d(plate.innerFoundationPoints[0].x - 1000, -plate.innerFoundationPoints[0].y), 200, plate.label);
    });
  }
}

function addMullionColumns(dxf, mullionColumn) {
  dxf.setCurrentLayerName('MullionColumn');
  if (Array.isArray(mullionColumn.polygons)) {
    mullionColumn.polygons.forEach(plate => {
      if (Array.isArray(plate.points) && plate.points.length >= 2) {
        addDimensionLines(dxf, plate.points, 'MullionColumn', 350);
        addPolyline(dxf, plate.points, 'MullionColumn');
        // Add dimension lines for mullion columns
      }
    });
  }
}

function addColumnTable(dxf, column) {
  const rowHeight = 700;
  const colWidths = [5500, 3000, 3000, 3000];
  const spacing = 1000;
  const processedColumnGroups = partitionGroupsByDimension(column.polygons, "column");


  const tableData = [];
  // Column labels: ['C1', 'C2', 'C3', ...]
  const temp = processedColumnGroups.map((group, index) => 'C' + (index + 1));

  // Column widths
  const colWidthsTemp = [5000].concat(new Array(temp.length).fill(5000));

  // Other fixed rows
  const concMixTemp = ['CONC. MIX'].concat(new Array(temp.length).fill('M−25'));
  const mainReinfTemp = ['MAIN REINF'].concat(new Array(temp.length).fill('8−16#+16−12#'));
  const confHeightTemp = ['CONF.HEIGHT'].concat(new Array(temp.length).fill('600'));
  const inRestTemp = ["IN REST"].concat(new Array(temp.length).fill("8#,150"));
  const inTemp = ["IN (ℓc)"].concat(new Array(temp.length).fill("8#,150"));

  // Log each group for debugging
  processedColumnGroups.forEach((group, index) => {
    console.log(`Group ${index + 1} (${group.name})`, group.columns);
  });

  // Get Bc × Dc dimensions
  const tempBcXDc = processedColumnGroups.map((group) => {
    if (group.columns.length === 0) return '';
    const { xMin, xMax, yMin, yMax } = getBounds(group.columns[0].points || []);
    const bc = Math.abs(xMin - xMax);
    const dc = Math.abs(yMin - yMax);
    return bc.toFixed(0) + " X " + dc.toFixed(0);
  });

  // Get column labels per group
  const groupColLables = processedColumnGroups.map((group) => {
    return group.columns.map(column => column.label).join(', ');
  });


  tableData.push(['Columns'].concat(temp))
  tableData.push(['BC X DC'].concat(tempBcXDc))
  tableData.push(['Label'].concat(groupColLables))
  tableData.push(concMixTemp);
  tableData.push(mainReinfTemp);
  tableData.push(confHeightTemp);
  tableData.push(inRestTemp);
  tableData.push(inTemp);


  // Create the table
  createTable(dxf, 0, 0, rowHeight, colWidthsTemp, tableData, 'Table');
}
function addFoundationTable(dxf, foundation) {
  const rowHeight = 700;
  const colWidths = [5500, 3000, 3000, 3000];
  const spacing = 1000;
  const processedFoundationGroups = partitionGroupsByDimension(foundation.groups, "Foundation");


  const tableData = [];
  // Column labels: ['C1', 'C2', 'C3', ...]
  const temp = processedFoundationGroups.map((group, index) => 'F' + (index + 1));

  // Column widths
  const colWidthsTemp = [5000].concat(new Array(temp.length).fill(5000));

  // Other fixed rows
  const concMixTemp = ['CONC. MIX'].concat(new Array(temp.length).fill('M−25'));
  const depthTemp = ['DEPTH'].concat(new Array(temp.length).fill('600'));
  const shortBarTemp = ['SHORT BAR'].concat(new Array(temp.length).fill('10#, 150 C/C'));
  const longBarTemp = ['LONG BAR'].concat(new Array(temp.length).fill('10#, 150 C/C'));
  // Log each group for debugging
  processedFoundationGroups.forEach((group, index) => {
    console.log(`Group ${index + 1} (${group.name})`, group.foundations);
  });

  // Get Bc × Dc dimensions
  const tempPCC = processedFoundationGroups.map((group) => {
    if (group.foundations.length === 0) return '';
    const { xMin, xMax, yMin, yMax } = getBounds(group.foundations[0].outerFoundationPoints || []);
    const bc = Math.abs(xMin - xMax);
    const dc = Math.abs(yMin - yMax);
    return bc.toFixed(0) + " X " + dc.toFixed(0);
  });
  const tempRCC = processedFoundationGroups.map((group) => {
    if (group.foundations.length === 0) return '';
    const { xMin, xMax, yMin, yMax } = getBounds(group.foundations[0].innerFoundationPoints || []);
    const bc = Math.abs(xMin - xMax);
    const dc = Math.abs(yMin - yMax);
    return bc.toFixed(0) + " X " + dc.toFixed(0);
  });

  // Get column labels per group
  const groupColLables = processedFoundationGroups.map((group) => {
    return group.foundations.map(column => column.label).join(', ');
  });


  tableData.push(['FOUNDATIONS'].concat(temp))
  tableData.push(['P. C. C. SIZE'].concat(tempPCC))
  tableData.push(['R. C. C. SIZE'].concat(tempRCC))
  tableData.push(['Label'].concat(groupColLables))
  tableData.push(depthTemp);
  tableData.push(shortBarTemp);
  tableData.push(longBarTemp);
  tableData.push(concMixTemp);


  // Create the table
  createTable(dxf, 0, 10000, rowHeight, colWidthsTemp, tableData, 'Table');
}


// Main function
const getDxfformPolygons = (req, res) => {
  const {
    wall = {},
    baseplate = { basePlates: [] },
    column = { columns: [] },
    foundation = { foundations: [] },
    mullionColumn = { mullionPositions: [] },
    dxfData = {},
  } = req.body;

  try {


    const dxf = new DxfWriter();
    initializeLayers(dxf, Colors);

    addDxfData(dxf, dxfData);
    addExternalWall(dxf, wall);
    addBasePlates(dxf, baseplate);
    addColumns(dxf, column);
    addFoundations(dxf, foundation);
    addMullionColumns(dxf, mullionColumn);
    addColumnTable(dxf, column);
    addFoundationTable(dxf, foundation);

    const dxfString = dxf.stringify();
    res.setHeader('Content-Disposition', 'attachment; filename="shed.dxf"');
    res.setHeader('Content-Type', 'application/dxf');
    res.send(dxfString);
  } catch (error) {
    console.error('DXF generation error:', error);
    res.status(500).json({
      error: 'Failed to generate DXF',
      details: error.message || 'Unknown error',
    });
  }
};


const temp = (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="shed.dxf"');
  res.setHeader('Content-Type', 'application/dxf');
  res.send(req.body);
};

module.exports = { getDxfEntitiesSampleFile, getDxfEntitiesFromFile, generateDxfFromJson, getSampleDxfFromJson, temp, getDxfformPolygons };