## AR Server
* The entry point for http requests is app.js
* the routing file is in routes/imageRoutes.js
* image operations are controlled under controllers/imageController.js
* image_database is actually just a file system for storing uploaded images
* roi (region of interest)-stores the current target location
* services are handled by ocrService.js (text recignition), 
    imageMatchingService.js     (Levenstien Distance Fomula Opperation), and dbOperations.js (Database Operations)
* test-tess.js (teseract test)
* varTest.js   (OCR Test)
* genVariant.js (random image brightness and contrast to image roi.png)

## OPENCV Install Instructions
# Server Setup 
* curl -0- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
* bash
* cd back/to/repo/directory
1. nvm install v16 

2. npm init 

3. pnpm install -g node-gyp

4. pnpm setup

If 1st install set up environment variables: 

* OPENCV_BUILD_ROOT=~/opencv 

If CMAKE Installed run 1 else start at 2 convert Unix commands to Windows if needed: 

1. ./node_modules/.bin/build-opencv rebuild 

2. sudo apt install cmake 

3. sudo apt install build-essential 

4. pnpm install –g node-gyp 

5. ./node_modules/.bin/build-opencv rebuild 
    (may need to bypass execution policy windows) 
