const cv = require('@u4/opencv4nodejs');
const path = require('path');
const fsSync = require('fs'); // For sync operations
const Tesseract = require('tesseract.js');

const performImageMatching = async (imagePath, boxData) => {
    // Extract image file
    const imageToMatch = cv.imread(imagePath); // This is the uploaded image

    // logic to read the image and perform matching
    // Now use boxX, boxY, boxWidth, and boxHeight to define the ROI
    const roi = imageToMatch.getRegion(new cv.Rect(boxData.x, boxData.y, boxData.width, boxData.height));
    //print roi cords to log
    console.log("x ", boxData.x);
    console.log("y ", boxData.y);
    console.log("width ", boxData.width);
    console.log("height ", boxData.height);
    //save roi to check contents
    cv.imwrite('c:\\test\\roi\\roi.png', roi);
    // Placeholder for best match data
    let bestMatch = { filePath: null, score: 0 };
    // Read database images and perform matching
    console.log("Current Working Directory:", process.cwd());
    const databasePath = './image_database';
    console.log(databasePath);
    const files = fsSync.readdirSync(databasePath);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(databasePath, file);
        // Assuming cv.imread and other variables/functions are defined correctly
        const dbImage = cv.imread(filePath);
        console.log("file path: " + filePath);
    
        // Perform template matching
        const matched = dbImage.matchTemplate(roi, cv.TM_CCOEFF_NORMED);
        const minMax = matched.minMaxLoc();
        const score = minMax.maxVal;
    
        console.log(`Match Results:`, matched);
        console.log(`Min and Max Locations:`, minMax);
        console.log(`Score: ${score}`);
    
        // Update the best match if the current score is greater
        if (score > bestMatch.score) {
            bestMatch = { filePath, score };
            if(bestMatch.score > .75) {
                break; // This will now correctly exit the loop
            }
        }
    }

    try {
        console.log("in try: ");
        if (bestMatch.score > 0.65) {
            // Check if bestMatch.filePath is valid
            console.log("in try first check: ");
            if (!bestMatch.filePath) {
                throw new Error("File path is missing in bestMatch object");
            }

            // Fetch the corresponding image from c:\test\userImg
            const correspondingImagePath = `c:\\test\\userImg\\${path.basename(bestMatch.filePath)}`;

            // Additional check: Verify if the file exists (requires fs module)
            if (!fsSync.existsSync(correspondingImagePath)) {
                throw new Error(`File not found: ${correspondingImagePath}`);
            }
            console.log("End of betMatch in if: ");
            return bestMatch;//first return this logic might be wrong.. there is a second return later for now it will be left as is. 
        } else {
            // Handle the case where score is below the threshold or bestMatch is not valid
            console.log("no match: ");
            throw new Error("No suitable match found or bestMatch is undefined");
        }
    } catch (error) {
        console.log("Its a ukalyley terry.. ");
        console.error(`Error occurred: ${error.message}`);
        // Return null or handle the error as per your application's needs
        return null;
    }


    await appendBestMatchData(bestMatch);
    return bestMatch;
    console.log("bestMatch returned");

};


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

function calculateTextSimilarity(text1, text2) {
    const distance = levenshteinDistance(text1, text2);
    // Normalize the score: 1 means identical, 0 means completely different
    const longestLength = Math.max(text1.length, text2.length);
    return longestLength === 0 ? 1 : (1 - distance / longestLength);
}


module.exports = {
    performImageMatching,
    levenshteinDistance,
    calculateTextSimilarity
};