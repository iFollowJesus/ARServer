const multer = require('multer');
const path = require('path');

// Set up storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // The path to the folder where you want to save the files
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Naming convention for the files (e.g., fieldname-timestamp.extension)
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Export the multer configuration
const upload = multer({ storage: storage });
module.exports = upload;



