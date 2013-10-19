var events = require("events"),
	sys = require("sys"),
	util = require("util"),
	spawn = require("child_process").spawn,
	fs = require("fs"),
	exec = require('child_process').exec,
	d3 = require("d3"),
	gm = require("gm");



//
// Detects triangles and quadrilaterals
//

// sourced from: https://github.com/peterbraden/node-opencv/tree/master/examples
//
// for test purposes:
// http://vps.provolot.com/site2site/pinpoint/testphoto1.JPG
// 638 x 479
var example_date = 
{
	image_width: 638,
	image_height: 479,
	coordinates: [
		[50, 50],
		[500, 60],
		[60, 300],
		[510, 310],
		[200, 200],
		[300, 300],
	]
}
/* var groupPath = function(d) {
        return "M" + d3.geom.hull(d.values.map(function(i) {
            console.log(i);
            return [$(i).attr("cx"), $(i).attr("cy")];
        })).join("L") + "Z";
    }; */

//get convex hull of coordinates
var coordhull = d3.geom.hull(example_date["coordinates"]);
var coordhull_svg = "M" + coordhull.join("L") + "Z";

console.log(coordhull_svg);
console.log("yo");


//testcommand = "convert -size 213x160 xc:white -stroke black -strokewidth 1 -fill none -draw \"circle 106,80 106,10\" circle.jpg";
imcommand = "convert -size 638x479 xc:white -stroke black -strokewidth 1 -fill none -draw \"polygon 50,50 500,60 60,300 510,310\" polygon.jpg";

this.exec_process = exec(imcommand, function (error, stdout, stderr) {
  console.log('stdout: ' + stdout);
//  console.log('stderr: ' + stderr);
  if (error !== null) {
    console.log('exec error: ' + error);
  }
});

/*
this.spawn_process = spawn(imcommand, imargs);
this.spawn_process.stdout.on('data', function (data) {
	console.log('stdout: ' + data);
	dout = data;
});

this.spawn_process.stderr.on('data', function (data) {
	console.log('stderr: ' + data);
	derr = data;
});

this.spawn_process.on('close', function (code) {    
	//emit exit signal for process chaining over time

	PROCESS_RUNNING_FLAG = false;
	this.spawn_process = null;
});
*/


