const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const originalImagePath = 'c:/test/roi/roi.png';
const outputDirectory = 'c:/test/roi';

// Ensure the output directory exists
if (!fs.existsSync(outputDirectory)){
    fs.mkdirSync(outputDirectory, { recursive: true });
}

const generateVariations = async (originalPath, numberOfVariations) => {
    for (let i = 0; i < numberOfVariations; i++) {
        const brightness = Math.random() * 0.4 + 0.8; // between 0.8 and 1.2
        const contrast = Math.random() * 0.4 + 0.8; // between 0.8 and 1.2

        const outputPath = path.join(outputDirectory, `variation-${i + 1}.jpg`);

        await sharp(originalPath)
            .modulate({
                brightness: brightness,
                saturation: 1,
                hue: 0
            })
            .linear(contrast)
            .toFile(outputPath);

        console.log(`Generated ${outputPath}`);
    }
};

generateVariations(originalImagePath, 100)
    .then(() => console.log('All variations generated.'))
    .catch(error => console.error('Error generating variations:', error));
