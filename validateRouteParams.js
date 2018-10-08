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
    const [imgDims, imgName] = [filename.split("+")[0], filename.split("+")[1]];
    const [imgWidth, imgHeight] = [
      parseInt(imgDims.split("x")[0]),
      parseInt(imgDims.split("x")[1])
    ];

    imgWidth
      ? (imageParams.imgWidth = imgWidth)
      : (imageParams.isValid = false);
    imgHeight
      ? (imageParams.imgHeight = imgHeight)
      : (imageParams.isValid = false);

    validateImageFileName(imgName)
      ? (imageParams.imgName = imgName)
      : (imageParams.isValid = false);
    imageParams.imgDims = imgDims;
  }

  return imageParams;
};

const validateRouteParams = (imgDir, rawImgName, resizeImgName) => {
  let routeParams = {};
  console.log(imgDir);
  console.log(rawImgName);
  console.log(checkDir(`/images/${imgDir}/`));
  console.log(checkDir(`/images/${imgDir}/raw/${rawImgName}`));

  //check raw route params - make sure imgDir and rawImgName exists and the provided file name is valid
  if (
    checkDir(`/images/${imgDir}/`) &&
    checkDir(`/images/${imgDir}/raw/${rawImgName}`) &&
    validateImageFileName(rawImgName) &&
    !resizeImgName
  ) {
    routeParams.imgType = rawImgName.split(".")[1];
    routeParams.dirPath = `./images/${imgDir}/`;
    routeParams.imgPath = `./images/${imgDir}/raw/${rawImgName}`;
  }

  //check resized route params

  if (checkDir(`/images/${imgDir}/`) && resizeImgName && !rawImgName) {
    let parseResults = parseResizeImageName(resizeImgName);
    if (parseResults) {
      routeParams = parseResults;
      routeParams.imgType = parseResults.imgName.split(".")[1];

      routeParams.dirPath = `./images/${imgDir}/`;
      routeParams.subDirPath = `./images/${imgDir}/${parseResults.imgDims}/`;
      routeParams.imgRawPath = `./images/${imgDir}/raw/${
        parseResults.imgName
      }/`;
      routeParams.imgResizePath = `./images/${imgDir}/${parseResults.imgDims}/${
        parseResults.imgName
      }/`;
      checkDir(`/images/${imgDir}/${parseResults.imgDims}/`)
        ? (routeParams.createSubDir = false)
        : (routeParams.createSubDir = true);
    }
  }

  return {
    routeParams,
    isValid: !isEmpty(routeParams)
  };
};

module.exports = validateRouteParams;

// [imageDirectory]	[rawImageName]
// goat-lake	IMG_0001.jpg
// kendall-katwalk	IMG_0001.jpg
// lake-colchuck	IMG_0024.png
// rattlesnake-ridge	IMG_0024.png
// tulip-festival	tulips.gif
// validateRouteParams("aaa", ".jpg");

// console.log(validateImageFileName("_a.jpg"));
// console.log(checkDir(`/images/goat-lake/raw/IMG_000.jpg`));
