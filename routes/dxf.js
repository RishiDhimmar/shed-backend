const { getDxfEntitiesSampleFile, getDxfEntitiesFromFile, generateDxfFromJson, temp, getDxfformPolygons } = require('../controllers/dxf');
const multer = require('multer');
const { scalePointsMiddleware } = require('../middlewares/scalePointsMiddleware');
const router = require('express').Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/dxf-entities', getDxfEntitiesSampleFile);
router.post('/upload-dxf', upload.single('dxfFile'), getDxfEntitiesFromFile);
router.post('/generate-dxf', getDxfformPolygons);
// router.post('/get-dxf-baseplates', getSampleDxfFromJson);
router.post('/temp', temp);



module.exports = router