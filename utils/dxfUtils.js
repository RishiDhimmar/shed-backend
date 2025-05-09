// utils/dxfUtils.js

const { LineTypes } = require("@tarikjabiri/dxf");
const { LineType } = require("dxf-writer");

/**
 * Converts flat [x, y, x, y, ...] array into array of { point: { x, y } }.
 */
function convertFlatPointsToVertices(points) {
    const vertices = [];
    for (let i = 0; i < points.length; i += 2) {
        vertices.push({ point: { x: points[i], y: -points[i + 1] } });
    }
    return vertices;
}

/**
 * Removes every third element from array (used for internal wall points).
 */
function filterEveryThird(points) {
    return points.map((p, i) => ((i + 1) % 3 !== 0 ? p : null)).filter(Boolean);
}

/**
 * Initializes layers for the DXF file.
 */
function initializeLayers(dxf, Colors) {
    dxf.addLayer('BasePlot', Colors.White, 'CONTINUOUS');
    dxf.addLayer('ExternalWall', Colors.Yellow, 'CONTINUOUS');
    dxf.addLayer('InternalWall', Colors.Yellow, 'CONTINUOUS');
    dxf.addLayer('BasePlates', Colors.Green, 'CONTINUOUS');
    dxf.addLayer('Columns', Colors.Blue, 'CONTINUOUS');
    dxf.addLayer('MullionColumn', Colors.Red, 'CONTINUOUS');
    dxf.addLayer('GroundBeam', Colors.Cyan, 'CONTINUOUS');
    dxf.addLayer('Foundation', Colors.Magenta, 'CONTINUOUS');
    dxf.addLayer('Dimensions', Colors.White);
    dxf.addLayer('Centerline', Colors.Green, 'DASHED');
    dxf.addLayer('DxfData', Colors.White, 'CONTINUOUS');
}

function getBounds(points) {
    const xValues = points.map((p) => p.x);
    const yValues = points.map((p) => p.y);
    return {
        xMin: Math.min(...xValues),
        xMax: Math.max(...xValues),
        yMin: Math.min(...yValues),
        yMax: Math.max(...yValues),
    };
}
function partitionGroupsByDimension(polygons) {
    const processed = [];
    for (const group of polygons) {
        if (group.length === 0) {
            processed.push(group);
            continue;
        }

        const dimensionMap = {};

        for (const polygon of group) {
            // Extract coordinates and calculate dimensions
            const xs = polygon.points.map(p => p.x);
            const ys = polygon.points.map(p => p.y);
            const width = Math.max(...xs) - Math.min(...xs);
            const height = Math.max(...ys) - Math.min(...ys);

            // Create order-agnostic dimension key
            const [dim1, dim2] = [width.toFixed(0), height.toFixed(0)].sort((a, b) => a - b);
            const dimensionKey = `${dim1}_${dim2}`;

            // Group polygons by normalized dimensions
            dimensionMap[dimensionKey] = dimensionMap[dimensionKey] || [];
            dimensionMap[dimensionKey].push(polygon);
        }

        // Preserve group or split into subgroups
        const subgroups = Object.values(dimensionMap);
        processed.push(...(subgroups.length === 1 ? [group] : subgroups));
    }

    return processed;
}



module.exports = {
    convertFlatPointsToVertices,
    filterEveryThird,
    initializeLayers,
    partitionGroupsByDimension,
    getBounds
};
