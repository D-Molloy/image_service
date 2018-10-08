const fs = require("fs");

// module.exports = function sendImg(path, format, width, height) {
//   const readStream = fs.createReadStream(path);
//   return readStream;
// };
module.exports = function sendImg(res, imgPath, imgType, dirPath) {
  const readStream = fs.createReadStream(imgPath);
  readStream.on("open", function() {
    // Set the content-type of the response based on the image filetype
    res.type(`${imgType}`);
    // Send the image
    readStream.pipe(res);
  });
  readStream.on("error", function() {
    const errors = {};
    if (!fs.existsSync(dirPath)) {
      errors.dirError = "The requested directory wasn't found.";
    } else if (fs.existsSync(dirPath) && !fs.existsSync(imgPath)) {
      errors.imgError = "The requested image wasn't found.";
    }
    res.status(404).json(errors);
  });
};
