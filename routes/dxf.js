const multer = require('multer');
const { getDxfEntitiesSampleFile, getDxfEntitiesFromFile, generateDxfFromJson, getSampleDxfFromJson, temp } = require('../controllers/dxf');
const scalePointsMiddleware = require('../middlewares/scalePointsMiddleware');

const router = require('express').Router();
const upload = multer({ storage: multer.memoryStorage() });


router.get('/dxf-entities', getDxfEntitiesSampleFile);
router.post('/upload-dxf', upload.single('dxfFile'),  getDxfEntitiesFromFile);
router.post('/generate-dxf', scalePointsMiddleware ,generateDxfFromJson);
// router.post('/get-dxf-baseplates', getSampleDxfFromJson);
router.post('/temp', temp);

module.exports = router;