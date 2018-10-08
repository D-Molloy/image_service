const express = require("express");
const logger = require("morgan");
const fs = require("fs");
const sharp = require("sharp");
const sendImg = require("./sendImg");

// validation modules
const validateRouteParams = require("./validateRouteParams");
const isEmpty = require("./isEmpty");
const app = express();

// setup morgan
app.use(logger("dev"));
const PORT = 4000;

// @route   GET api/images/raw/:imageDir/:imageName
// @desc    Send raw image file
// @access  Public
app.get("/api/images/raw/:imgDir/:imgName", (req, res) => {
  const { imgDir, imgName } = req.params;

  let validationResults = validateRouteParams(imgDir, imgName, null);
  console.log(validationResults);
  if (!validationResults.isValid) {
    const error = {
      error:
        "There is an issue with the imageDirectory or rawImageName you are requesting.  Please check the documentation and try again.",
      requestedUrl: `http://localhost:4000/api/images/raw/${imgDir}/${imgName}`,
      documentation:
        "https://github.com/D-Molloy/image_service/blob/master/README.md"
    };
    return res.status(404).json(error);
  }

  let { imgPath, imgType, dirPath } = validationResults.routeParams;
  sendImg(res, imgPath, imgType, dirPath);
});

// @route   GET api/images/resize/:imgDir/:imgDimName
// @desc    Send a resized image based on the dimensions included in imgDimName
// @access  Public
app.get("/api/images/resize/:imgDir/:imgDimName", (req, res) => {
  // imgDimName - 800x600+IMG_0001.jpg
  const { imgDir, imgDimName } = req.params;
  let validationResults = validateRouteParams(imgDir, null, imgDimName);
  console.log(validationResults);
  if (!validationResults.isValid) {
    const error = {
      error:
        "There is an issue with the imageDirectory you are requesting or the format of the resizedImageName you are requesting.  Please check the documentation and try again.",
      requestedUrl: `http://localhost:4000/api/images/resize/${imgDir}/${imgDimName}`,
      documentation:
        "https://github.com/D-Molloy/image_service/blob/master/README.md"
    };
    return res.status(404).json(error);
  }

  let {
    imgResizePath,
    subDirPath,
    imgType,
    createSubDir
  } = validationResults.routeParams;
  // //check to see if the subDir exists, if not, create it

  if (createSubDir) {
    let { imgRawPath, imgHeight, imgWidth } = validationResults.routeParams;
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
    //   //the requested dimensions subDir exists, so send the existing file
    console.log("SubDir exists. Sending the requested image.");
    sendImg(res, imgResizePath, imgType, subDirPath);
    //   // const readStream = fs.createReadStream(imgResizePath);
    //   // readStream.on("open", function() {
    //   //   // Set the content-type of the response
    //   //   res.type(`${imgType}`);
    //   //   // Send the image
    //   //   readStream.pipe(res);
    //   // });
    //   // readStream.on("error", function(err) {
    //   //   // do id need to set the content type if just sending json
    //   //   // res.set("Content-Type", "application/json");
    //   //   res
    //   //     .status(404)
    //   //     .json({ msg: "The requested file could not be found.", err });
    //   // });
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
