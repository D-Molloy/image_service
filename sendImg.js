const fs = require("fs");

module.exports = function sendImg(path, format, width, height) {
  const readStream = fs.createReadStream(path);
  return readStream;
};
