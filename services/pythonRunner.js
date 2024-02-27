// pythonRunner.js

const { exec } = require('child_process');

const runPythonScript = (pythonScriptPath) => {
  exec(`python "${pythonScriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
  });
};

module.exports = runPythonScript;