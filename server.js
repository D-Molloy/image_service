const express = require("express");
const logger = require("morgan");
const fs = require("fs");
const sharp = require("sharp");
const sendImg = require("./sendImg");
const checkDirectory = require("./checkDirectory");

const app = express();

// setup morgan
app.use(logger("dev"));
const PORT = 4000;

// @route   GET api/images/raw/:imageDir/:imageName
// @desc    Send raw image file
// @access  Public
app.get("/api/images/raw/:imgDir/:imgName", (req, res) => {
  // ??  toLowercase path and name
  //  error checking
  // change imgDir to rawImageDir
  //change path to imagePath
  const { imgDir, imgName } = req.params;
  const imgType = imgName.split(".")[1].toLowerCase();
  // const dirPath = __dirname + `./images/${imgDir}/`;
  // const imgPath = __dirname + `./images/${imgDir}/raw/${imgName}`;
  const dirPath = `./images/${imgDir}/`;
  const imgPath = `./images/${imgDir}/raw/${imgName}`;

  // console.log(`imgDir: ${imgDir}
  // imageType: ${imageType}
  // imgName: ${imgName}
  // path: ${imgPath}`);

  // // WORKS - no error handling
  // res.type(`${imageType}`);
  // sendImg(imgPath).pipe(res); //4.484ms

  // works with error checking
  const readStream = fs.createReadStream(imgPath);
  readStream.on("open", function() {
    // Set the content-type of the response
    res.type(`${imgType}`);
    // Send the image
    readStream.pipe(res);
  });
  readStream.on("error", function() {
    const errors = {};
    if (!fs.existsSync(dirPath)) {
      errors.directory = "The requested directory wasn't found.";
    } else if (fs.existsSync(dirPath) && !fs.existsSync(imgPath)) {
      errors.image = "The requested image wasn't found.";
    }

    res.set("Content-Type", "application/json");
    res.status(404).json(errors);
  });
});

// @route   GET api/images/resize/:imgDir/:imgDimName
// @desc    Send a resized image based on the dimensions included in imgDimName
// @access  Public
app.get("/api/images/resize/:imgDir/:imgDimName", (req, res) => {
  // imgDimName - 800x600+IMG_0001.jpg
  const { imgDir } = req.params;
  // const imgDims = req.params.imgDimName.split("+")[0];
  // const imgName = req.params.imgDimName.split("+")[1];
  const [imgDims, imgName] = [
    req.params.imgDimName.split("+")[0],
    req.params.imgDimName.split("+")[1]
  ];
  const imgType = imgName.split(".")[1].toLowerCase();
  const [imgWidth, imgHeight] = [
    parseInt(imgDims.split("x")[0]),
    parseInt(imgDims.split("x")[1])
  ];

  const dirPath = `./images/${imgDir}/`;
  const subDirPath = `./images/${imgDir}/${imgDims}`;
  const imgRawPath = `./images/${imgDir}/raw/${imgName}`;
  const imgResizePath = `./images/${imgDir}/${imgDims}/${imgName}`;

  console.log(`imgDir - ${imgDir}
  imgDims - ${imgDims}
  imgName - ${imgName}
  imgWidth - ${typeof imgWidth}
  imgHeight - ${imgHeight}`);

  //TODO - check to make sure dirPath exists

  //check to see if the subDir exists, if not, create it
  checkDirectory(subDirPath);

  // use sharp to resize raw image, save and send
  sharp(imgRawPath)
    .resize(imgWidth, imgHeight)
    .toFile(imgResizePath)
    .then(() => {
      res.type(`${imgType}`);
      sendImg(imgResizePath).pipe(res);
    });
  // Set the content-type of the response
});

// Code catch all route.  Send an obj with example routes for raw and resized

app.listen(PORT, () => {
  console.log(`Service listening on PORT: ${PORT}`);
});

// SHARP - https://malcoded.com/posts/nodejs-image-resize-express-sharp

// check if directory exists, if not make it - https://blog.raananweber.com/2015/12/15/check-if-a-directory-exists-in-node-js/

// https://stackoverflow.com/questions/4482686/check-synchronously-if-file-directory-exists-in-node-js
// https://stackoverflow.com/questions/5823722/how-to-serve-an-image-using-nodejs
