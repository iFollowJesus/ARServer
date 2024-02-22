const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');

// Define the directory where your images are stored
const imagesDirectory = path.join(__dirname, 'roi');

// Prepare to store results
let extractedTexts = [];

// Function to recognize text from an image
function recognizeTextFromImage(imagePath, index) {
    return Tesseract.recognize(
        imagePath,
        'eng',
        {
            logger: m => console.log(`Processing variation-${index}:`, m)
        }
    ).then(({ data: { text } }) => {
        console.log(`Recognized Text from variation-${index}:`, text);
        return { index, text }; // Return an object containing the index and recognized text
    }).catch(error => {
        console.error('Error:', error);
        return null; // In case of error, return null or handle as needed
    });
}

// Function to process all images and store results
async function processImages() {
    for (let i = 1; i <= 100; i++) {
        const imagePath = path.join(imagesDirectory, `variation-${i}.jpg`);
        const result = await recognizeTextFromImage(imagePath, i);
        if (result) {
            extractedTexts.push(result); // Store each result with its index
        }
    }

    // After processing all images, you can compare the strings or further analyze the results here
    console.log('All texts extracted:', extractedTexts);

    // Example: Write results to a file (optional)
    fs.writeFileSync(path.join(__dirname, 'extractedTexts.json'), JSON.stringify(extractedTexts, null, 2), 'utf-8');
}

// Run the processing function
processImages();
