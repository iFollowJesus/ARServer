const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
// Import the imageRoutes
const imageRoutes = require('./routes/imageRoutes');

console.log("This is a debug message");
console.log("The value of variable x is:");

// Setup for file upload
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

// Use the imageRoutes for any requests to "/api/images"
app.use('/api/images', imageRoutes);

// use the androidRoutes for retrieveMedia, and retrieveMarkers
app.use('/api/android', androidRoutes);

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
