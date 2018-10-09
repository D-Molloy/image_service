# Image Resize Service

## Overview:

This **Image Resize Service** (implemented with Node.js v10.9.0) sends raw and custom-resized images. Two endpoints are provided to deliver 1) original/raw images or 2) a resized version of the raw image with custom dimensions.

### Dependencies

- express (web app framework)
- sharp (image processing)
- morgan (request logger)

### Supported Image Formats

- jpg, png, gif

## Installation

> git clone `https://github.com/D-Molloy/image_service.git`

> cd image_service

> npm i

> node server

## Endpoint Usage

1. For getting a **raw** image:

   `http://localhost:4000/api/images/raw/[imageDirectory]/[rawImageName]`

   - This endpoint uses `[imageDirectory]` to specify which image is to be sent (e.g. `kendall-katwalk`). Each `[imageDirectory]` includes a `raw` folder that contains `[`rawImageName]`, which is sent to the user.

   - **Example request**:
     `http://localhost:4000/api/images/raw/kendall-katwalk/IMG_0001.jpg`

2. For getting a custom **resized** image:

   `http://localhost:4000/api/images/resize/[imageDirectory]/[resizedImageName]`

   - This endpoint uses `[imageDirectory]` to specify which image is to be resized. `[resizedImageName]` is parsed to find the requested dimensions for the new image along with the filename of the raw image to be resized.
   - If the requested image dimensions have never been requested, a subdirectory is added to `[imageDirectory]` which is named after the requested dimensions (e.g. if the requested dimensions are '1024x768' the subdirectory is named '1024x768'). The image is resized using the sharp node module, and the resulting image is saved in the new directory. This provides an increased response time should those specific dimensions be requested again (due to the file already existing).

   - Note on `[resizedImageName]`: Per the instructions, `[resizedImageName]` is some composition of `[rawImageName]` + `[resizeOption]`. For my implementation, `[resizeOption]` is **required** to be numbers representing 'width x height' followed `[rawImageName]`. An example of a valid `[resizedImageName]` is **800x600+IMG_0001.jpg** which would result in an 800x600 copy of IMG_0001.jpg raw image.

   - Requested dimensions must be greater than 0.

   - A potential alternative endpoint would be to separate the requested dimensions into it's own request parameter

- **Example request**:
  `http://localhost:4000/api/images/resize/kendall-katwalk/1024x768+IMG_0001.jpg`

### Stored Image Reference

| [imageDirectory]  | [rawImageName] |
| ----------------- | -------------- |
| goat-lake         | IMG_0001.jpg   |
| kendall-katwalk   | IMG_0001.jpg   |
| lake-colchuck     | IMG_0024.png   |
| rattlesnake-ridge | IMG_0024.png   |
| tulip-festival    | tulips.gif     |
