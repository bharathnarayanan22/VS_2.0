const express = require('express');
const router = express.Router();
const { uploadFaceData, checkFace } = require('../controllers/faceController');

router.post('/upload', uploadFaceData);
router.post('/check', checkFace);

module.exports = router;
