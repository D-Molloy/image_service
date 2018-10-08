const express = require("express");
const logger = require("morgan");
const fs = require("fs");
const sharp = require("sharp");
const sendImg = require("./sendImg");

const app = express();

// setup morgan
app.use(logger("dev"));
const PORT = 4000;

// @route   GET api/images/raw/:imageDir/:imageName
// @desc    Send raw image file
// @access  Public
app.get("/api/images/raw/:imgDir/:imgName", (req, res) => {
  // TODO - toLowercase path and name

  const { imgDir, imgName } = req.params;
  const imgType = imgName.split(".")[1].toLowerCase();
  const dirPath = `./images/${imgDir}/`;
  const imgPath = `./images/${imgDir}/raw/${imgName}`;

  sendImg(res, imgPath, imgType, dirPath);
  // works -  with error checking
  // const readStream = fs.createReadStream(imgPath);
  // readStream.on("open", function() {
  //   // Set the content-type of the response
  //   res.type(`${imgType}`);
  //   // Send the image
  //   readStream.pipe(res);
  // });
  // readStream.on("error", function() {
  //   const errors = {};
  //   if (!fs.existsSync(dirPath)) {
  //     errors.directory = "The requested directory wasn't found.";
  //   } else if (fs.existsSync(dirPath) && !fs.existsSync(imgPath)) {
  //     errors.image = "The requested image wasn't found.";
  //   }
  //   // do id need to set the content type if just sending json
  //   // res.set("Content-Type", "application/json");
  //   res.status(404).json(errors);
  // });
});

// @route   GET api/images/resize/:imgDir/:imgDimName
// @desc    Send a resized image based on the dimensions included in imgDimName
// @access  Public
app.get("/api/images/resize/:imgDir/:imgDimName", (req, res) => {
  // imgDimName - 800x600+IMG_0001.jpg
  const { imgDir } = req.params;
  const [imgDims, imgName] = [
    req.params.imgDimName.split("+")[0],
    req.params.imgDimName.split("+")[1]
  ];
  const imgType = imgName.split(".")[1].toLowerCase();
  const [imgWidth, imgHeight] = [
    parseInt(imgDims.split("x")[0]),
    parseInt(imgDims.split("x")[1])
  ];

  //TODO - send an error if dimensions aren't included

  const dirPath = `./images/${imgDir}/`;
  const subDirPath = `./images/${imgDir}/${imgDims}`;
  const imgRawPath = `./images/${imgDir}/raw/${imgName}`;
  const imgResizePath = `./images/${imgDir}/${imgDims}/${imgName}`;

  // console.log(`imgDir - ${imgDir}
  // imgDims - ${imgDims}
  // imgName - ${imgName}
  // imgWidth - ${typeof imgWidth}
  // imgHeight - ${imgHeight}`);

  //TODO - check to make sure dirPath exists
  if (!fs.existsSync(dirPath))
    return res
      .status(404)
      .json({ msg: "The requested image directory doesn't exist" });

  //check to see if the subDir exists, if not, create it
  if (!fs.existsSync(subDirPath)) {
    console.log("SubDir Created. Creating and sending the requested image.");
    // create the image resolution-specific directory
    fs.mkdirSync(subDirPath);
    //use the Sharp module to resize and save the image, then send it back
    sharp(imgRawPath)
      .resize(imgWidth, imgHeight)
      .toFile(imgResizePath)
      .then(() => {
        sendImg(res, imgResizePath, imgType, subDirPath);
        // sendImg(imgResizePath).pipe(res);
      });
  } else {
    //the requested dimensions subDir exists, so send the existing file
    console.log("SubDir exists. Sending the requested image.");
    sendImg(res, imgResizePath, imgType, subDirPath);
    // const readStream = fs.createReadStream(imgResizePath);
    // readStream.on("open", function() {
    //   // Set the content-type of the response
    //   res.type(`${imgType}`);
    //   // Send the image
    //   readStream.pipe(res);
    // });
    // readStream.on("error", function(err) {
    //   // do id need to set the content type if just sending json
    //   // res.set("Content-Type", "application/json");
    //   res
    //     .status(404)
    //     .json({ msg: "The requested file could not be found.", err });
    // });
  }

  // TO-DO - catch an error and send a message that error occurred while processing image
});

// Code catch all route.  Send an obj with example routes for raw and resized

app.listen(PORT, () => {
  console.log(`Service listening on PORT: ${PORT}`);
});

// SHARP - https://malcoded.com/posts/nodejs-image-resize-express-sharp

// check if directory exists, if not make it - https://blog.raananweber.com/2015/12/15/check-if-a-directory-exists-in-node-js/

// https://stackoverflow.com/questions/4482686/check-synchronously-if-file-directory-exists-in-node-js
// https://stackoverflow.com/questions/5823722/how-to-serve-an-image-using-nodejs
