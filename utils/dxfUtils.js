// utils/dxfUtils.js

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
    dxf.addLayer('Dimensions', Colors.White, 'Dashed');
    dxf.addLayer('Centerline', Colors.Green, 'DASHED');
    dxf.addLayer('DxfData', Colors.White, 'CONTINUOUS');
}

module.exports = {
    convertFlatPointsToVertices,
    filterEveryThird,
    initializeLayers,
};
