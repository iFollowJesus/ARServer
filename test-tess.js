const Tesseract = require('tesseract.js');
const path = require('path');

const imagePath = path.join(__dirname, 'roi/roi.png'); // Replace with your actual image path

Tesseract.recognize(
    imagePath,
    'eng', // Language
    {
        logger: m => console.log(m) // Log progress and information
    }
).then(({ data: { text } }) => {
    console.log('Recognized Text:', text); // Output recognized text
}).catch(error => {
    console.error('Error:', error); // Output any errors
});
