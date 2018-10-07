const fs = require("fs");

module.exports = function checkDirectory(directory) {
  try {
    fs.statSync(directory);
    console.log("subDir existed");
  } catch (e) {
    fs.mkdirSync(directory);
    console.log("directory didn't exist so it was created");
  }
};
