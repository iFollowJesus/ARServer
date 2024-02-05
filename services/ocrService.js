const Tesseract = require('tesseract.js');

const recognizeText = async (imagePath) => {
    try {
        const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
            logger: m => console.log(m)
        });
        console.log('Recognize Text: ', text);
        return text;
    } catch (error) {
        console.error('Error during text recognition: ', error);
        return '';
    }
};


module.exports = recognizeText;

/*
 * Basic setup to use service.
 * // imageMatchingService.js or any other file
const recognizeText = require('./ocrService');

// Use the function with an image path
const imagePath = 'path/to/your/image.jpg';
recognizeText(imagePath)
    .then(text => {
        console.log("Extracted Text: ", text);
        // Do something with the extracted text
    })
    .catch(error => {
        console.error("Error: ", error);
    });*/