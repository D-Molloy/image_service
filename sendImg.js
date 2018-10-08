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
    res.status(500).json({ error: "The requested file could not be found" });
  });
};
