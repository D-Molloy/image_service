// validateRouteParams.js is used to validate parameters entered for raw and resize requests
const fs = require("fs");
const isEmpty = require("./isEmpty");

// check to see if a directory exists
const checkDir = directory => {
  try {
    fs.statSync(__dirname + directory);
    return true;
  } catch (e) {
    return false;
  }
};

//check to make sure filename is valid - file extension IS case sensitive
const validateImageFileName = fileName =>
  /\.(gif|jpg|png)$/.test(fileName) && /^[a-z0-9_.-]+\.[^.]+$/i.test(fileName);

//parse data from resizeImagePath
const parseResizeImageName = filename => {
  let imageParams = {};

  // check for required characters in filename
  if (
    filename.indexOf("x") === -1 ||
    filename.indexOf("+") == -1 ||
    filename.indexOf(".") === -1
  ) {
    imageParams.isValid = false;
  } else {
    // parse the file name into dimensions and filename
    const [imgDims, imgName] = [
      filename.split("+")[0],
      filename.split("+")[1].toLowerCase()
    ];
    const [imgWidth, imgHeight] = [
      parseInt(imgDims.split("x")[0]),
      parseInt(imgDims.split("x")[1])
    ];

    // ensure height and with are numbers greater than 0, if not, set invalid flag
    imgWidth && imgWidth > 0
      ? (imageParams.imgWidth = imgWidth)
      : (imageParams.isValid = false);
    imgHeight && imgHeight > 0
      ? (imageParams.imgHeight = imgHeight)
      : (imageParams.isValid = false);

    //ensure the file name is valid, if not, set invalid flag
    validateImageFileName(imgName)
      ? (imageParams.imgName = imgName)
      : (imageParams.isValid = false);
    imageParams.imgDims = imgDims;
  }

  return imageParams;
};

// parse and validate the resizeImgName parameter for use when creating a resized image
const validateRouteParams = (imgDir, rawImgName, resizeImgName) => {
  let routeParams = {};

  //check raw route params - make sure imgDir and rawImgName exists and the provided file name is valid
  if (
    checkDir(`/images/${imgDir}/`) &&
    checkDir(`/images/${imgDir}/raw/${rawImgName}`) &&
    validateImageFileName(rawImgName) &&
    !resizeImgName
  ) {
    // set routeParams for retrieving the requested file
    routeParams.imgType = rawImgName.split(".")[1];
    routeParams.dirPath = `./images/${imgDir}/`;
    routeParams.imgPath = `./images/${imgDir}/raw/${rawImgName.toLowerCase()}`;
  }

  //check resized route params
  if (checkDir(`/images/${imgDir}/`) && resizeImgName) {
    let parseResults = parseResizeImageName(resizeImgName);
    // ensure the raw file needed for the resize exists
    if (
      !fs.existsSync(
        __dirname + `/images/${imgDir}/raw/${parseResults.imgName}`
      )
    ) {
      return { isValid: false };
    }

    //ensure the resizeImgName is valid
    if (parseResults.isValid === false) {
      return { isValid: false };
    }
    // if validation passes, set routeParams for creating and retrieving the requested file
    routeParams = parseResults;
    routeParams.imgType = parseResults.imgName.split(".")[1];

    routeParams.dirPath = `./images/${imgDir}/`;
    routeParams.subDirPath = `./images/${imgDir}/${parseResults.imgDims}/`;
    routeParams.imgRawPath = `./images/${imgDir}/raw/${parseResults.imgName}`;
    routeParams.imgResizePath = `./images/${imgDir}/${parseResults.imgDims}/${
      parseResults.imgName
    }`;
    //set flag for whether the custom resize directory needs to be created
    checkDir(`/images/${imgDir}/${parseResults.imgDims}/`)
      ? (routeParams.createSubDir = false)
      : (routeParams.createSubDir = true);
  }

  return {
    routeParams,
    isValid: !isEmpty(routeParams)
  };
};

module.exports = validateRouteParams;
