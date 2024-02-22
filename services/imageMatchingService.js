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
function levenshteinDistance(str1, str2) {
    let l1 = str1.length();
    let l2 = str2.length();

    if (l1 == 0)
        return l2;
    if (l2 == 0)
        return l1;

    let matrix = new [l1 + 1][l2 + 1];

    for (let i = 0; i <= l1; i++)
        matrix[i][0] = i;

    for (let j = 0; j <= l2; j++)
        matrix[0][j] = j;

    for (let i = 1; i <= l1; i++) {
        let ch1 = str1.charAt(i - 1);

        for (let j = 1; j <= l2; j++) {
            let ch2 = str2.charAt(j - 1);

            let match = ch1 == ch2 ? 0 : 1;

            matrix[i][j] = 
            Math.min(
                Math.min(
                    (matrix[i - 1] + 1),
                    (matrix[i][j - 1] + 1)
                ),
                matrix[i - 1][j - 1] + m
            );
        }
    }

    return matrix[l1][l2];
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
    console.log('current wd: ' + process.cwd());
    const imageToMatch = cv.imread(imagePath);
    const roi = imageToMatch.getRegion(new cv.Rect(boxData.x, boxData.y, boxData.width, boxData.height));
    try {
        console.log('try block before imwrite: ');
        cv.imwrite('./roi/roi.png', roi);
    } catch (error) {
        console.error('Failed to write image:', error);
    }
    const roiPath = './roi/roi.png';

    const textInROI = await recognizeText(roiPath);
    console.log('current wd2: ' + process.cwd());
    const bestMatch = await matchImages('./image_database', textInROI);
    console.log('current wd3: ' + process.cwd());
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
    performImageMatching,
    levenshteinDistance,
    calculateTextSimilarity
};

