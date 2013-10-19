#!/usr/bin/env node

//
// Finds quadrilaterals and fills them with an X
//

var cv = require('opencv');
var console = require('console');

var lowThresh = 0;
var highThresh = 100;
var nIters = 2;
var minArea = 2000;
var maxArea = 100000;

var BLUE = [0, 255, 0]; //B, G, R
var RED   = [0, 0, 255]; //B, G, R
var GREEN = [0, 255, 0]; //B, G, R
var WHITE = [255, 255, 255]; //B, G, R

cv.readImage('./images/testphoto1.jpg', function(err, im) {

  // var out = im.copy();

  im.convertGrayscale();
  im_canny = im.copy();
  im_canny.canny(lowThresh, highThresh);
  im_canny.dilate(nIters);

  contours = im_canny.findContours();
  var shapes = [];

  for(i = 0; i < contours.size(); i++) {

    var area = contours.area(i);
    if(area < minArea || area > maxArea)
      continue;

    var arcLength = contours.arcLength(i, true);
    contours.approxPolyDP(i, 0.01 * arcLength, true);

    // only process rectangles (num_of_corners = 4)
    if(contours.cornerCount(i) != 4)
      continue;

    // point coordinates
    var p0 = [contours.point(i, 0).x, contours.point(i, 0).y];
    var p1 = [contours.point(i, 1).x, contours.point(i, 1).y];
    var p2 = [contours.point(i, 2).x, contours.point(i, 2).y];
    var p3 = [contours.point(i, 3).x, contours.point(i, 3).y];

    var av_x = (p0[0] + p1[0] + p2[0] + p3[0])/4;
    var av_y = (p0[1] + p1[1] + p2[1] + p3[1])/4;

    // out.drawContour(contours, i, RED);
    var asdasd = im_canny.meanStdDev();
    asdasd.mean.save(['./cimg',i,'.jpg'].join(''))

    shapes.push({
      color: 'red',
      center: [av_x,av_y]
    })
  }

  for(i = 0; i < shapes.length; i++) {
    // console.dir(shapes[i]);
  }
});
