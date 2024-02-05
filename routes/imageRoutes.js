const express = require('express');
const multer = require('multer');
const router = express.Router();
const imageController = require('../controllers/imageController');
const upload = require('../config/multerConfig');

router.post('/upload', upload.single('imageToMatch'), imageController.uploadImage);
router.post('/match', upload.single('imageToMatch'), imageController.matchImage);
router.post("/studioUpload", upload.fields([{ name: 'video', maxCount: 1 }, { name: 'image', maxCount: 1 }, { name: 'marker', maxCount: 1 }]),  imageController.studioUpload);

module.exports = router;
