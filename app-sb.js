var cv = require('opencv');
var shapemaker = require('./shapemaker');
var Spacebrew = require('./sb-1.3.0').Spacebrew,
    sb,
    fs = require("fs"),
    config = require("./machine");


var files_location = "/files/";
var filepath = __dirname + files_location;
var input_directory = "input/";
var output_directory = "output/";
var hosted_path = "http://api.sitetosite.co/modules/pinpoint/" + files_location;


sb = new Spacebrew.Client( config.server, config.name, config.description );  // create spacebrew client object


sb.addSubscribe("file input", "binary");  // subscription for receiving image binary

sb.addPublish("output image", "string", "");   // publish source image
sb.addPublish("input image", "string", "");   // publish source image


sb.onCustomMessage = onCustomMessage;
sb.onOpen = onOpen;

// connect to spacbrew
sb.connect(); 



function onOpen(){
  console.log( "Connected through Spacebrew as: " + sb.name() + "." );
}


function onCustomMessage(name, value, type){

  switch(type){
    case "binary":
      if(name == "file input"){
        console.log('file buffer received');

        var json_value = JSON.parse( value );


        console.log('filename: '+ json_value.filename + ' with encoding: ' + json_value.encoding);

        var b64_buf = new Buffer(json_value.binary, 'base64').toString('binary');
        var buf = new Buffer(b64_buf, 'binary');


        setTimeout(function(){
          var filename = filepath + input_directory + json_value.filename;

          console.log('trying to write input file to: ' + filename);

          //TODO: add check for if filepath directory exists, if not create it

          fs.writeFile(filename, buf, 'binary', function(err){
            console.log(filename + ' written, sending to processImage()');

            //console.log('sending url: ' + hosted_path + timestamp_filename);

            sb.send("input image", "string", hosted_path + input_directory + json_value.filename);
            processImage(json_value.filename);

          });
        }, 2000);

          

        
      }
  }
}


// open cv config
var lowThresh = 0;
var highThresh = 100;
var nIters = 2;
var minArea = 2000;
var maxArea = 100000;

//var orgimg = "input/testphoto2.jpg";
//var destimg = "output/"+orgimg.replace('input/','');

function processImage(orgfilename){

  var destimg = filepath + output_directory + orgfilename;
  var orgimg = filepath + input_directory + orgfilename;

  cv.readImage(orgimg, function(err, im) {

    im.convertGrayscale();
    im_canny = im.copy();
    im_canny.canny(lowThresh, highThresh);
    im_canny.dilate(nIters);

    contours = im_canny.findContours();
    var points = [];

    for(i = 0; i < contours.size(); i++) {

      var area = contours.area(i);
      if(area < minArea)
        continue;

      var arcLength = contours.arcLength(i, true);
      contours.approxPolyDP(i, 0.01 * arcLength, true);

      if(contours.cornerCount(i) != 4)
        continue;

      // point coordinates
      var p0 = [contours.point(i, 0).x, contours.point(i, 0).y];
      var p1 = [contours.point(i, 1).x, contours.point(i, 1).y];
      var p2 = [contours.point(i, 2).x, contours.point(i, 2).y];
      var p3 = [contours.point(i, 3).x, contours.point(i, 3).y];

      var av_x = (p0[0] + p1[0] + p2[0] + p3[0])/4;
      var av_y = (p0[1] + p1[1] + p2[1] + p3[1])/4;

      points.push([av_x,av_y]);
    }

    var shape = new shapemaker();
    var data = {
      image_width: im_canny.width(),
      image_height: im_canny.height(),
      coordinates: points
    };

    shape.mask(data, orgimg, destimg, function(err, destimage){
      sb.send("output image", "string", hosted_path + output_directory + orgfilename);
    });

  });
}
