var events = require("events"),
	sys = require("sys"),
	util = require("util"),
	spawn = require("child_process").spawn,
	fs = require("fs"),
	exec = require('child_process').exec,
	d3 = require("d3");

//
// Detects triangles and quadrilaterals
//

// sourced from: https://github.com/peterbraden/node-opencv/tree/master/examples
//
// for test purposes:
// http://vps.provolot.com/site2site/pinpoint/images/testphoto2.JPG

////////////////////////////
//////////////// TEST DATA
////////////////////////////

var example_data_1 =
{
	image_width: 816,
	image_height: 612,
	coordinates: [
		[50, 50],
		[500, 60],
		[60, 300],
		[510, 310],
		[200, 200],
		[300, 300],
	]
}

var example_data_2 =
{
	image_width: 816,
	image_height: 612,
	coordinates: [
		[282,84],
		[468,300],
		[298,374],
		[80,278],
	]
}

var example_data_3 =
{
	image_width: 816,
	image_height: 612,
	coordinates: [
		[282,84],
		[468,300],
	]
}

var data = example_data_2;
var orgimg = "images/testphoto2.jpg";
var destimg = orgimg + ".shaped.png";


////////////////////////////
//////////////// TEST DATA END
////////////////////////////

function shapemaker() {
}

util.inherits( shapemaker, events.EventEmitter );


shapemaker.prototype.mask = function(data, orgimg, destimg) {

	//get maxX and maxY from data
	var maxX = data["image_width"];
	var maxY = data["image_height"];

	var mask_svg = "";

	if(data["coordinates"].length >= 3) {
		//DRAW A POLYGON

		//get convex hull of coordinates
		var coordhull = d3.geom.hull(data["coordinates"]);
		var mask_svg = "polygon " + coordhull.join(" ") ;
	} else if(data["coordinates"].length >= 2) {
		//DRAW A CIRCLE

		//circle x0,y0 x1,y1
		//The first point x0,y0 is the center, the second point x1,y1 is any other point on the circle, this being used to calculate a radius.

		//two coordinates are the outer bounds of a circle.
		//so: we get a midpoint between the points and use that as the center;
		//then we use any point as the edge.

		var midX =
			(data["coordinates"][0][0] +
			data["coordinates"][1][0]) / 2;
		var midY =
			(data["coordinates"][0][1] +
			data["coordinates"][1][1]) / 2;
		var edgeX = data["coordinates"][0][0];
		var edgeY = data["coordinates"][0][1];

		mask_svg = "circle " + midX + "," + midY + " " + edgeX + "," + edgeY;

		console.log("drawing circle" + mask_svg);
	}

	//chained imagemagick command - create a mask, mask it, write to destimg
	imcommand = "convert -size " + maxX + "x" + maxY + " xc:black -stroke none -fill white -draw \"" + mask_svg + "\" -write mpr:mask +delete mpr:mask -auto-orient -write mpr:mask +delete " + orgimg + " mpr:mask -alpha Off -compose CopyOpacity -composite " + destimg;

	//console.log(imcommand);

	this.exec_process = exec(imcommand, function (error, stdout, stderr) {
	//  console.log('stdout: ' + stdout);
	//  console.log('stderr: ' + stderr);
		if (error !== null) {
			console.log('exec error: ' + error);
		} else {
			console.log(destimg);
		}

		//emit exit signal for process chaining over time
		//this.emit( "exit", destimg);

	});
};


module.exports = shapemaker;


