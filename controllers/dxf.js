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

/**
* Creates a table in the DXF document
* 
* @param {Object} dxf - DXF writer instance
* @param {Number} x - x position of the table top-left corner
* @param {Number} y - y position of the table top-left corner
* @param {Number} width - total width of the table
* @param {Number} rowHeight - height of each row
* @param {Array} colWidths - array of column widths
* @param {Array} data - 2D array of table content
* @param {String} layer - layer name for the table
*/
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

    res.json({ entities: filteredEntities });
  } catch (err) {
    console.error('Error parsing uploaded DXF:', err.message);
    res.status(500).json({ error: 'Failed to parse uploaded DXF file', details: err.message });
  }
};


const generateDxfFromJson = (req, res) => {

  const { basePlot, wall, baseplate, column, foundation, mullionColumn, groundBeam } = req.body;
  console.log("foundtion is : ", foundation)
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
    dxf.addLayer('Table', Colors.White, 'CONTINUOUS'); // Add new layer for table

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

    let maxX = 0;
    let minY = 0;

    if (Array.isArray(basePlot.points) && basePlot.points.length > 0) {
      basePlot.points.forEach(point => {
        const [x, y] = point;
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
      })
    }

    // Draw External Wall
    createPolylineFromPoints(wall.externalWallPoints || [], 'ExternalWall');

    // Draw Internal Wall
    createPolylineFromPoints(wall.internalWallPoints || [], 'InternalWall');

    // Draw BasePlates
    baseplate.basePlates.forEach(plate => {
      if (Array.isArray(plate.points) && plate.points.length >= 2) {
        createPolylineFromPoints(plate.points || [], 'BasePlates');
      }
    });

    // Draw Columns with labels
    if (column && Array.isArray(column.columns)) {
      column.columns.forEach(col => {
        if (Array.isArray(col.points) && col.points.length >= 2) {
          createPolylineFromPoints(col.points || [], 'Columns');

          // Set current layer for text
          dxf.setCurrentLayerName('Columns');

          if (col.labelPosition && col.labelPosition.length >= 2) {
            const [x, y, z = 0] = col.labelPosition;

            // Create text at the correct position with consistent scaling
            dxf.addText(
              point3d(x * 1000, y * 1000, z * 1000), // Scale all coordinates by 1000
              250, // Text height appropriate for the scale
              col.label || 'No Label',
              {
                layer: 'Columns',
                rotation: col.labelRotation || 0,
                color: Colors.White
              }
            );
          } else if (col.points.length > 0) {
            // Fallback: Calculate centroid if labelPosition is missing
            const centroid = col.points.reduce(
              (acc, [px, py]) => [acc[0] + px, acc[1] + py],
              [0, 0]
            ).map(c => c / col.points.length);

            dxf.addText(
              point3d(centroid[0] * 1000, centroid[1] * 1000, 0),
              250, // Text height
              col.label || 'No Label',
              {
                layer: 'Columns',
                rotation: col.labelRotation || 0,
                color: Colors.White
              }
            );
          }
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
            // createLinearDimension(dxf, plate.points[1], plate.points[2], 5);
          } catch (e) {
            console.error('Error creating dimension:', e.message);
          }
        }
      });
    }

    // DYNAMIC TABLE DATA GENERATION
    // Organize columns by type
    let cornerColumns = [];
    let horizontalColumns = [];
    let verticalColumns = [];

    if (column && Array.isArray(column.columns)) {
      column.columns.forEach(col => {
        if (col.type === 'corner') {
          cornerColumns.push(col);
        } else if (col.type === 'horizontal') {
          horizontalColumns.push(col);
        } else if (col.type === 'vertical') {
          verticalColumns.push(col);
        }
      });
    }

    // Updated getColumnDimensions to use width and length directly
    const getColumnDimensions = (columns) => {
      if (!columns || columns.length === 0) {
        return "N/A";
      }

      const col = columns[0];
      try {
        // Use the width and length properties from the column object
        const width = ((col.width).toFixed(2)) * 1000;
        const length = (col.length.toFixed(2)) * 1000;
        return `${width} * ${length}`;
      } catch (e) {
        console.error('Error retrieving column dimensions:', e);
        return "N/A";
      }
    };

    // Get foundation dimensions
    const getFoundationDimensions = (foundationValues, type) => {
      if (!foundationValues || !foundationValues[type]) {
        return { rcc: "N/A", pcc: "N/A" };
      }
      const data = foundationValues[type];
      try {
        const rcc = `${data.RccBf.toFixed(2)} * ${data.rccLf.toFixed(2)}`; // Keep in original units, 2 decimals
        const pcc = `${data.pccWidth.toFixed(2)} * ${data.pccLength.toFixed(2)}`;
        console.log(`Foundation ${type}: RCC = ${rcc}, PCC = ${pcc}`);
        return { rcc, pcc };
      } catch (e) {
        console.error(`Error retrieving foundation dimensions for ${type}:`, e);
        return { rcc: "N/A", pcc: "N/A" };
      }
    };

    // Table layout
    const rowHeight = 700;
    const colWidths = [5500, 3000, 3000, 3000];
    const spacing = 1000;

    let tableX = maxX !== -Infinity ? maxX + spacing : 0;
    let tableY = minY !== Infinity ? minY - spacing : 0;

    const cornerDimensions = getColumnDimensions(cornerColumns);
    const horizontalDimensions = getColumnDimensions(horizontalColumns);
    const verticalDimensions = getColumnDimensions(verticalColumns);
    console.log("colmnsa are: ", cornerDimensions, horizontalDimensions, verticalDimensions)


    // Get foundation dimensions
    const cornerFoundation = getFoundationDimensions(foundation?.values, 'corner');
    const verticalFoundation = getFoundationDimensions(foundation?.values, 'vertical');
    const horizontalFoundation = getFoundationDimensions(foundation?.values, 'horizontal');

    // Static table data - header row and data rows
    const tableData = [
      ['Component', 'C1', 'C2', 'C3'],
      ['SIZE(bc*dc)', cornerDimensions, horizontalDimensions, verticalDimensions],
      ['CONC.MIX', "M−25", "M−25", "M−25"],
      ['MAIN REINF', "8−16#+16−12#", "4−16#+12−12#", "4−16#+14−12#"],
      ['CONF.HEIGHT', "600", "600", "600"],
      ["IN REST", "4−RING\n4−LINK", "2−RING\n2−LINK", "2−RING\n3−LINK"],
      ["IN (ℓc)"],
      ["R.C.C SIZE (Bf x Lf)", cornerFoundation.rcc, verticalFoundation.rcc, horizontalFoundation.rcc],
      ["P.C.C. SIZE", cornerFoundation.pcc, verticalFoundation.pcc, horizontalFoundation.pcc],
      ["D", foundation?.values?.corner?.depthD.toFixed(2) || "N/A", foundation?.values?.vertical?.depthD.toFixed(2) || "N/A", foundation?.values?.horizontal?.depthD.toFixed(2) || "N/A"],
      ["d", foundation?.values?.corner?.depthd.toFixed(2) || "N/A", foundation?.values?.vertical?.depthd.toFixed(2) || "N/A", foundation?.values?.horizontal?.depthd.toFixed(2) || "N/A"],
      ["SHORT BAR", `${foundation?.values?.corner?.shortBarCount}#,${foundation?.values?.corner?.shortBarSpacing} C/C`, `${foundation?.values?.vertical?.shortBarCount}#,${foundation?.values?.vertical?.shortBarSpacing} C/C`, `${foundation?.values?.horizontal?.shortBarCount}#,${foundation?.values?.horizontal?.shortBarSpacing} C/C`],
      ["LONG BAR", `${foundation?.values?.corner?.longBarCount}#,${foundation?.values?.corner?.longBarSpacing} C/C`, `${foundation?.values?.vertical?.longBarCount}#,${foundation?.values?.vertical?.longBarSpacing} C/C`, `${foundation?.values?.horizontal?.longBarCount}#,${foundation?.values?.horizontal?.longBarSpacing} C/C`],
      ["CONC. MIX", "M−25", "M−25", "M−25"],

    ];

    // Create the table
    createTable(dxf, tableX, tableY, rowHeight, colWidths, tableData, 'Table');

    // if(column && column.columns.length > 0) {
    //   column.columns.forEach((col) => {
    //     if (col.points && col.points.length >= 2) {
    //       try {
    //         createLinearDimension(dxf, col.points[0], col.points[1], 5);
    //         createLinearDimension(dxf, col.points[1], col.points[2], 5);
    //       } catch (e) {
    //         console.error('Error creating dimension:', e.message);
    //       }
    //     }
    //   });
    // }
    // if(foundation && foundation.foundations.length > 0) {
    //   foundation.foundations.forEach((f) => {
    //     if (f.points && f.points.length >= 2) {
    //       try {
    //         createLinearDimension(dxf, f.points[0], f.points[1], 5);
    //         createLinearDimension(dxf, f.points[1], f.points[2], 5);
    //       } catch (e) {
    //         console.error('Error creating dimension:', e.message);
    //       }
    //     }
    //   });
    // }

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


