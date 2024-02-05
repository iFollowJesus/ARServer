const cv = require('@u4/opencv4nodejs');
const path = require('path');
const fsSync = require('fs'); // For sync operations
const Tesseract = require('tesseract.js'); // Tesseract OCR for text recognition

/**
 * Calculates the Levenshtein distance between two strings.
 * @param {string} a - The first string.
 * @param {string} b - The second string.
 * @returns {number} - The Levenshtein distance.
 */
function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1)); // deletion
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Calculates the similarity score based on the Levenshtein distance.
 * @param {string} text1 - The first text string.
 * @param {string} text2 - The second text string.
 * @returns {number} - A normalized similarity score between 0 and 1.
 */
function calculateTextSimilarity(text1, text2) {
    const distance = levenshteinDistance(text1, text2);
    // Normalize the score: 1 means identical, 0 means completely different
    const longestLength = Math.max(text1.length, text2.length);
    return longestLength === 0 ? 1 : (1 - distance / longestLength);
}

/**
 * Calculates the score based on the text extracted from ROI.
 * @param {string} textInROI - The text extracted from the ROI.
 * @param {string} textInDB - The text extracted from the database image.
 * @returns {number} - A score representing how well the texts match.
 */
function calculateScore(textInROI, textInDB) {
    return calculateTextSimilarity(textInROI, textInDB);
}

// Text Detection and Recognition
const recognizeText = async (image) => {
    try {
        const { data: { text } } = await Tesseract.recognize(image, 'eng', {
            logger: m => console.log(m)
        });
        console.log('Recognized Text:', text); // Recognized text
        return text;
    } catch (error) {
        console.error('Error during text recognition:', error);
        return '';
    }
};

// Main function to perform image matching
const performImageMatching = async (imagePath, boxData) => {
    const imageToMatch = cv.imread(imagePath);
    const roi = imageToMatch.getRegion(new cv.Rect(boxData.x, boxData.y, boxData.width, boxData.height));
    cv.imwrite('c:\\test\\roi\\roi.png', roi);
    const roiPath = 'c:\\test\\roi\\roi.png';

    const textInROI = await recognizeText(roiPath);
    const bestMatch = await matchImages('c:\\test\\image_database', textInROI);

    await appendBestMatchData(bestMatch);
    return bestMatch;
};

// Matches images from the database
async function matchImages(databasePath, textInROI) {
    let bestMatch = { filePath: null, score: 0 };
    const files = fsSync.readdirSync(databasePath);

    for (const file of files) {
        const filePath = path.join(databasePath, file);
        try {
            const textInDB = await recognizeText(filePath);
            const score = calculateScore(textInROI, textInDB);

            if (score > bestMatch.score) {
                bestMatch = { filePath, score };
            }
        } catch (error) {
            console.error(`Error processing file ${filePath}:`, error);
        }
    }

    return bestMatch;
}


const appendBestMatchData = async (bestMatch) => {
    const bestMatchDataPath = './BestMatchData/BestMatchData.json';

    let data = [];

    // Check if the file exists and is not empty
    if (fsSync.existsSync(bestMatchDataPath) && fsSync.statSync(bestMatchDataPath).size > 0) {
        const fileContent = fsSync.readFileSync(bestMatchDataPath, 'utf8');
        try {
            data = JSON.parse(fileContent);
        } catch (error) {
            console.error("Error parsing JSON from file:", error);
            // Handle the error (e.g., initialize data as an empty array or log the error)
        }
    }

    // Append the new data
    data.push(bestMatch);

    // Write the updated array back to the file
    await fsSync.writeFileSync(bestMatchDataPath, JSON.stringify(data, null, 2));
    console.log("End of append.. ");
};


module.exports = {
    performImageMatching
};
