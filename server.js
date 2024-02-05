const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const cv = require('@u4/opencv4nodejs');
const path = require('path');


const app = express();
const PORT = 3000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


app.use(cors()); // Enables CORS for all routes

app.use((req, res, next) => {
    console.log("Headers:", req.headers);
    next();
});

app.get('/retrieve-string', (req, res) => {
    res.send("Hello from Node.js server!");
});

// Route for the root
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

const uploadPath = 'uploads/';//Directory to save uploaded images

app.post('/upload-image', upload.single('imageToMatch'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const savedImagePath = path.join(uploadPath, req.file.filename);
    fs.writeFileSync(savedImagePath, req.file.buffer);
    res.json({ savedImagePath });
});


app.post('/match-image', upload.single('imageToMatch'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const savedImagePath = path.join(uploadPath, req.file.filename);
    fs.writeFileSync(savedImagePath, req.file.buffer);

    try {
        // Load image from the request
        const imageToMatch = cv.imdecode(req.file.buffer);

        // Placeholder for best match data
        let bestMatch = { filePath: null, score: 0 };

        // Read database images and perform matching
        const databasePath = './image_database'; 
        const files = fs.readdirSync(databasePath);

        files.forEach(file => {
            const filePath = path.join(databasePath, file);
            const dbImage = cv.imread(filePath);

            // Perform template matching
            const matched = dbImage.matchTemplate(imageToMatch, cv.TM_CCOEFF_NORMED);
            const minMax = matched.minMaxLoc();
            const score = minMax.maxVal;

            // Update the best match if the current score is greater
            if (score > bestMatch.score) {
                bestMatch = { filePath, score };
            }
        });

        // Send best match information
        const bestMatchData = JSON.stringify(bestMatch, null, 2); // Format the JSON
        if (bestMatchData) {
            fs.writeFileSync('C:/test/BestMatchData/BestMatchData.json', bestMatchData);
        } else {
            console.log("bestMatchData is undefined of empty");
        }
        
        res.json({bestMatch, savedImagePath});
    } catch (error) {
        res.status(500).send(`Internal Server Error: ${error}`);
    }
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
