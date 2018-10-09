const express = require("express");
const logger = require("morgan");
const fs = require("fs");
const sharp = require("sharp");
const sendImg = require("./sendImg");

// validation module
const validateRouteParams = require("./validateRouteParams");

const app = express();

// setup morgan
app.use(logger("dev"));
const PORT = 4000;

// @route   GET api/images/raw/:imageDir/:imageName
// @desc    Send raw image file
// @access  Public
app.get("/api/images/raw/:imgDir/:imgName", (req, res) => {
  const { imgDir, imgName } = req.params;
  // validate the route params
  let validationResults = validateRouteParams(imgDir, imgName, null);
  //if the params weren't valid, send an error
  if (!validationResults.isValid) {
    const error = {
      error:
        "There is an issue with the imageDirectory and/or rawImageName parameters you are requesting.  Please check the documentation and try again.",
      requestedParams: `imageDirectory: ${imgDir} - rawImageName: ${imgName}`,
      documentation:
        "https://github.com/D-Molloy/image_service/blob/master/README.md"
    };
    return res.status(404).json(error);
  }
  //if validation is passed, send the image
  let { imgPath, imgType } = validationResults.routeParams;
  sendImg(res, imgPath, imgType);
});

// @route   GET api/images/resize/:imgDir/:imgDimName
// @desc    Send a resized image based on the dimensions included in imgDimName
// @access  Public
app.get("/api/images/resize/:imgDir/:imgDimName", (req, res) => {
  const { imgDir, imgDimName } = req.params;
  // validate the request params
  let validationResults = validateRouteParams(imgDir, null, imgDimName);
  // if params don't pass validation, send an error
  if (!validationResults.isValid) {
    const error = {
      error:
        "There is an issue with the imageDirectory you are requesting or the format of the resizedImageName you are requesting.  Please check the documentation and try again.",
      requestedParams: `imageDirectory: ${imgDir} - resizedImageName: "${imgDimName}"`,
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

  // if the requested image size doesn't exist, create the subdirectory and save the resized image
  if (createSubDir) {
    let { imgRawPath, imgHeight, imgWidth } = validationResults.routeParams;

    // create the image resolution-specific directory
    fs.mkdirSync(subDirPath);
    //use the Sharp module to resize and save the image, then send it back
    sharp(imgRawPath)
      .resize(imgWidth, imgHeight)
      .toFile(imgResizePath)
      .then(() => {
        sendImg(res, imgResizePath, imgType);
      });
  } else {
    // if the requested resize dimensions already exist, send the existing image
    sendImg(res, imgResizePath, imgType);
  }
});

// @route   GET - Catch All
// @desc    Catches any routes that don't match the Raw and Resize routes above
// @access  Public
app.get("*", (req, res) => {
  const message = {
    msg:
      "Thanks for using Image Resize Service. Please use one of the following endpoints to get a RAW or RESIZED image.  View the documentation for more details.",
    RAW: "http://localhost:4000/api/images/raw/[imageDirectory]/[rawImageName]",
    RESIZED:
      "http://localhost:4000/api/images/resize/[imageDirectory]/[resizedImageName]",
    documentation:
      "https://github.com/D-Molloy/image_service/blob/master/README.md"
  };

  res.json(message);
});

app.listen(PORT, () => {
  console.log(`Service listening on PORT: ${PORT}`);
});
