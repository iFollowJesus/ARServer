const fs = require('fs').promises; // Use the promise-based version of 'fs'
const fso = require('fs');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const imageService = require('../services/imageMatchingService');
const dbOp = require('../services/dbOperations');

const uploadPath = '../uploads/';
const markerPath = path.join(__dirname, '../image_database/');
const userImagePath = path.join(__dirname, '../userImg/');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '_' + file.originalname);
    }
});

const upload = multer({ storage: storage });

exports.uploadImage = async (req, res) => {
    console.log('Body:', req.body);
    console.log('File:', req.file);
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    
    try {
        const savedImagePath = path.join(uploadPath, req.file.filename);
        await fs.writeFile(savedImagePath, req.file.buffer);
        //res.json({ savedImagePath });
    } catch (error) {
        console.log("error in imageControler.js line 32 saving file.. ");
        res.status(500).send(`Error saving file: ${error.message}`);
    }
};
console.log("before match: ");

exports.matchImage = async (req, res) => {
    const startTime = new Date();
    console.log("start time: " + startTime);
    if (!req.file) {
        console.log("No file uploaded: ");
        return res.status(400).send('No file uploaded.');
    }
    console.log("after ifh: ");
    try {
        console.log("in try.. ");
        console.log(req.file.path);
        const uploadedImagePath = req.file.path;
        console.log(uploadedImagePath);

        // Extract box data from req.body
        const boxData = {
            x: parseFloat(req.body.boxX),
            y: parseFloat(req.body.boxY),
            width: parseFloat(req.body.boxWidth),
            height: parseFloat(req.body.boxHeight)
        };

        // Validate box data
        if (isNaN(boxData.x) || isNaN(boxData.y) || isNaN(boxData.width) || isNaN(boxData.height)) {
            return res.status(400).send('Invalid box data.');
        }

        const bestMatch = await imageService.performImageMatching(uploadedImagePath, boxData);

        console.log("the best match is " + bestMatch.filePath);
        if (!bestMatch.filePath) {
            throw new Error("No matching image path returned ");
        }

        console.log(`Best match found: ${bestMatch.filePath}`);
        //constructing filepaths to return files
        console.log('current wd3: ' + process.cwd());
        let baseDir = './userImg/';
        let fileNameWithoutExt = path.basename(bestMatch.filePath, path.extname(bestMatch.filePath));
        console.log("filename: " + fileNameWithoutExt);
        // Constructing new file paths
        let imageFilePath = path.join(baseDir, fileNameWithoutExt + '.png');
        let videoFilePath = path.join(baseDir, fileNameWithoutExt + '.mp4');
        let markerImg, usrImgOrVideo, contentType;
        console.log("image file " + imageFilePath);
        console.log("vid file " + videoFilePath);
        try {
            // Read marker image
            if (fso.existsSync(bestMatch.filePath)) {
                markerImg = await fs.readFile(bestMatch.filePath);
                markerImg = markerImg.toString('base64');
            }

            // Read user image or video
            if (fso.existsSync(imageFilePath)) {
                let imgData = await fs.readFile(imageFilePath);
                usrImgOrVideo = imgData.toString('base64');
                contentType = 'image';
            } else if (fso.existsSync(videoFilePath)) {
                let videoData = await fs.readFile(videoFilePath);
                usrImgOrVideo = videoData.toString('base64');
                contentType = 'video';
            }

            // Check if either file was found and read
            if (markerImg && usrImgOrVideo) {
                res.json({ markerImg, usrImgOrVideo, contentType });
            } else {
                res.status(404).send('Files not found');
            }

        } catch (error) {
            console.log(`Error in imageController.js: ${console.error(error)}`);
            res.status(500).send(`Error in image matching: ${error.message}`);
        }
        const endTime = new Date();
        const duration = endTime - startTime;
        console.log("end time: " + endTime);
        console.log("duration: " + duration);

    }catch (error) {
            console.log('last catch block');
        }
};

exports.studioUpload = async (req, res) => {
    console.log("in the studio Upload");

    if (!req.files || Object.keys(req.files).length === 0) {
        console.log("No files uploaded");
        return res.status(400).send("No files were uploaded.");
    }

    try {

        // Assuming the marker is always uploaded
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const markerFile = req.files['marker'][0];

        // get the basename
        const baseName = path.basename(markerFile.originalname, path.extname(markerFile.originalname));

        //combine base name with unique suffix
        const markerFilename = uniqueSuffix + '-' + baseName;

        // Path for the marker file
        const markerUploadPath = path.join(__dirname, '../image_database/', markerFilename + ".png");

        // Move and rename the video/image file to match the marker's name
        const mediaType = req.files['video'] ? 'video' : 'image';
        const mediaFile = req.files[mediaType][0];

        //set file extension based on media type
        const fileExtension = mediaType === 'video' ? '.mp4' : '.png';

        // Create the upload path with the appropriate file extension
        const mediaUploadPath = path.join(__dirname, '../userImg/', markerFilename + fileExtension);

        // Save files
        await fs.rename(path.join('uploads/', mediaFile.filename), mediaUploadPath);
        await fs.rename(path.join('uploads/', markerFile.filename), markerUploadPath);
        
        res.send("Files uploaded and renamed successfully.");
    } catch (error) {
        console.log("Error in studio upload");
        res.status(500).send(`Error: ${error.message}`);
    }
};


