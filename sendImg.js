// sendImg is used to send the file from the file system
const fs = require("fs");

module.exports = function sendImg(res, imgPath, imgType) {
  //create a stream for sending the file
  const readStream = fs.createReadStream(imgPath);
  // if it exists, send it
  readStream.on("open", function() {
    res.type(`${imgType}`);
    readStream.pipe(res);
  });
  // if and error occurs, inform the user
  readStream.on("error", function() {
    res.status(500).json({
      error:
        "The requested file could not be found.  Please ensure the correct file extension was used."
    });
  });
};
