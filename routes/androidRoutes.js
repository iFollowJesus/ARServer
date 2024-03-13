const express = require('express');
const multer = require('multer');
const router = express.Router();
const androidController = require('../controllers/androidController');
const upload = require('../config/multerConfig');

router.post('/retrieveMarkers', upload.single('category'), androidController.retrieveMarkers);
router.post("/retrieveMedia", upload.single('fileName'), androidController.retrieveMedia);

module.exports = router;
