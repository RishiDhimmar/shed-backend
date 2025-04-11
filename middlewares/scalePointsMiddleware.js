const scalePointsMiddleware = (req, res, next) => {
    const scalePoints = (points) =>
        Array.isArray(points)
            ? points.map((point) => ([point[0] * 1000, point[1] * 1000]))
            : [];

    const scaleEntity = (entity, key) => {
        console.log(entity[key])
        if (entity && Array.isArray(entity[key])) {
            entity[key] = scalePoints(entity[key]);
        }

    };

    try {
        const { basePlot, wall, baseplate, column, foundation, mullionColumn, groundBeam } = req.body;

        if (basePlot) scaleEntity(basePlot, 'points');
        if (wall) {
            scaleEntity(wall, 'externalWallPoints');
            scaleEntity(wall, 'internalWallPoints');
        }
        if (baseplate?.basePlates) {
            baseplate.basePlates.forEach((plate) => {
                scaleEntity(plate, 'points');
            });
        }
        if (column?.columns) {
            column.columns.forEach((col) => {
                scaleEntity(col, 'points');
            });
        }
        if (foundation?.foundations) {
            foundation.foundations.forEach((f) => {
                scaleEntity(f, 'points');
            });
        }
        if (mullionColumn?.mullionPositions) {
            mullionColumn.mullionPositions = mullionColumn.mullionPositions.map(scalePoints);
        }
        if (groundBeam) scaleEntity(groundBeam, 'points');


        next();
    } catch (err) {
        console.error('Error scaling points:', err.message);
        res.status(500).json({ error: 'Failed to scale DXF coordinates', details: err.message });
    }
}

module.exports = { scalePointsMiddleware }
