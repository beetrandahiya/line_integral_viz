"use strict";

// "pixel" dimensions 
var pixelWidth = 2;
var scale = 64; // a scale factor
// nodes settings
var xMin = -5;
var xMax = 5;
var yMin = -5;
var yMax = 5;

// rotation angles [rad]
var rotx = 300 * Math.PI/180;
var roty = 25 * Math.PI/180;
var rotz = 0 * Math.PI/180;

var nodes =[];
var nodesAxes =[];

var cont = document.getElementById('container');
// Obtain a reference to the canvas element.
var canvas  = document.getElementById("myCanvas");
// Obtain a 2D context from the canvas element.
var cxt = canvas.getContext("2d");


cxt.lineCap = "round";
cxt.lineJoin = "round";
cxt.font = 'normal 16px Inter';

sizeCanvas();	
	
// *** Mouse rotate. ***	
var mouseX = 0, mouseY = 0, pmouseX, pmouseY; // mouseX is current mouse x-coordinate, pmouseX is previous mouse x-coordinate when it was 1 pixel different.  
// Figure must rotate iff mousemove AND mousedown (for mouse devices):
var mouseDown = false;
cont.addEventListener("mousedown", handleMousedown, false);	
cont.addEventListener("touchstart", handleMousedown, false);	
document.addEventListener("mouseup", function (e) { if(mouseDown) mouseDown = false; canvas.style.cursor = "grab"; }, false);	
cont.addEventListener("mousemove", handleMove, false);
cont.addEventListener("touchmove", handleMove, false);

//Zoom with mouse wheel
canvas.addEventListener("wheel", function(e) {
    if (e.deltaY < 0) {
        scale *= 1.1;
    }
    else {
        scale /= 1.1;
    }
    drawFunction();
    e.preventDefault();
});



function handleMousedown(e) {
	if(!mouseDown) mouseDown = true;
	canvas.style.cursor = "grabbing";
	var x = parseInt(e.pageX) || parseInt(e.changedTouches[0].pageX);
	var y = parseInt(e.pageY) || parseInt(e.changedTouches[0].pageY);
	mouseX = x;
	mouseY = y;
	e.preventDefault();
};
  
function handleMove(e) {
	var sensetivity = 100; // how sensitive the mouse should be

	// getting mouseX, mouseY, pmouseX and pmouseY.	
	pmouseX = mouseX;
	pmouseY = mouseY;
	var x = parseInt(e.pageX) || parseInt(e.changedTouches[0].pageX);
	var y = parseInt(e.pageY) || parseInt(e.changedTouches[0].pageY);	
	if (Math.abs(x - pmouseX) >= 1) {mouseX = x;} else { mouseX = pmouseX }
	if (Math.abs(y - pmouseY) >= 1) {mouseY = y;} else { mouseY = pmouseY }	

	// change rotation
	//if(e.which==1 || e.buttons==1) {
	if(mouseDown === true) {
		rotx = rotx + (mouseY - pmouseY)/sensetivity;
		roty = roty + (mouseX - pmouseX)/sensetivity;
		drawFunction();
	}
	e.preventDefault();
};
// *** END Mouse rotate. ***



drawFunction();

window.addEventListener("resize", initial);

function initial() {
	sizeCanvas();
	drawFunction();
};

function sizeCanvas() {	
	/// Make size of canvas equal to size container and move canvas to center
	var cs = getComputedStyle(cont);
	/// these will return dimensions in *pixel* regardless of what
	/// you originally specified for container:
	canvas.width = parseInt(cs.getPropertyValue('width'), 10);
	canvas.height = parseInt(cs.getPropertyValue('height'), 10);
	cxt.translate(canvas.width/2, canvas.height/2);	
};	

function drawFunction() {

    //start performance timer
    var t0 = performance.now();

	cxt.clearRect(-canvas.width, -canvas.height, 2*canvas.width, 2*canvas.height);

    function fx(t){
        return 2*Math.sin(t)
    }
    function fy(t){
        return 2*Math.cos(t)
    }
    function fz(t){
        return t/5
    }

    var i=0;
    var dt=0.01;
    var z_d = 1;   // move the center of the graph along z-axis
    for (var t = -Math.PI; t <= 6*Math.PI; t += dt) {
        nodes[i] = {x:fx(t), y:fy(t), z:fz(t)-z_d};
        ++i;
    }
    
	nodesAxes[0] = {x:0, y:0, z:-z_d};
	nodesAxes[1] = {x:xMax, y:0, z:-z_d};
	nodesAxes[2] = {x:0, y:yMax, z:-z_d};
	nodesAxes[3] = {x:0, y:0, z:xMax-z_d};
	
	// rotate nodes
	rotateX3D(rotx);	
	rotateY3D(roty);
	rotateZ3D(rotz);
    //zoom3D(scale);
	

    // draw axes
	cxt.strokeStyle = "black";
    cxt.lineWidth = 1;
    cxt.font = 'normal 14px Inter';
	cxt.beginPath();
	cxt.moveTo(nodesAxes[0].x*scale,nodesAxes[0].y*scale);
	cxt.lineTo(nodesAxes[1].x*scale,nodesAxes[1].y*scale);
	cxt.stroke();      
    cxt.fillText('x',nodesAxes[1].x*scale,nodesAxes[1].y*scale);	
	cxt.beginPath();
	cxt.moveTo(nodesAxes[0].x*scale,nodesAxes[0].y*scale);
	cxt.lineTo(nodesAxes[2].x*scale,nodesAxes[2].y*scale);
	cxt.stroke();
    cxt.fillText('y',nodesAxes[2].x*scale,nodesAxes[2].y*scale);		
	cxt.beginPath();
	cxt.moveTo(nodesAxes[0].x*scale,nodesAxes[0].y*scale);
	cxt.lineTo(nodesAxes[3].x*scale,nodesAxes[3].y*scale);
	cxt.stroke();
    cxt.fillText('z',nodesAxes[3].x*scale,nodesAxes[3].y*scale);	



    
	// draw figure
	
	for (var i=0; i < nodes.length; i++) {
        cxt.beginPath();
		cxt.strokeStyle = `hsl(${i/nodes.length*360}, 100%, 50%)`
        cxt.lineWidth = 4;
		var px = nodes[i].x;
		var py = nodes[i].y;

		//cxt.fillRect(px*scale,py*scale,pixelWidth,pixelWidth)

        cxt.lineTo(px*scale,py*scale);
        if(i<nodes.length-1){
            var px2 = nodes[i+1].x;
        var py2 = nodes[i+1].y;
        cxt.lineTo(px2*scale,py2*scale);
        }
        cxt.stroke();
	}

    //end performance timer
    var t1 = performance.now();
    console.log("Call to draw took " + (t1 - t0) + " milliseconds.")

};

// Rotate shape around the z-axis, i.e. the non-rotated axis, perpendicular to the screen.
function rotateZ3D(theta) {
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);
    
    for (var n=0; n<nodes.length; n++) {
        var node = nodes[n];
        var x = node.x;
        var y = node.y;
        node.x = x * cosTheta - y * sinTheta;
        node.y = y * cosTheta + x * sinTheta;
    }
    for (n=0; n<nodesAxes.length; n++) {
        node = nodesAxes[n];
        x = node.x;
        y = node.y;
        node.x = x * cosTheta - y * sinTheta;
        node.y = y * cosTheta + x * sinTheta;
    }	
};

// Rotate shape around the y-axis, i.e. the non-rotated axis, vertical to the screen.
function rotateY3D(theta) {
    var sinTheta = Math.sin(-theta);
    var cosTheta = Math.cos(-theta);
    
    for (var n=0; n<nodes.length; n++) {
        var node = nodes[n];
        var x = node.x;
        var z = node.z;
        node.x = x * cosTheta - z * sinTheta;
        node.z = z * cosTheta + x * sinTheta;
    }
    for (n=0; n<nodesAxes.length; n++) {
        node = nodesAxes[n];
        x = node.x;
        z = node.z;
        node.x = x * cosTheta - z * sinTheta;
        node.z = z * cosTheta + x * sinTheta;
    }	
};

// Rotate shape around the x-axis, i.e. the non-rotated axis, horizontal to the screen.
function rotateX3D(theta) {
    var sinTheta = Math.sin(-theta);
    var cosTheta = Math.cos(-theta);
    
    for (var n=0; n<nodes.length; n++) {
        var node = nodes[n];
        var y = node.y;
        var z = node.z;
        node.y = y * cosTheta - z * sinTheta;
        node.z = z * cosTheta + y * sinTheta;
    }
    for (n=0; n<nodesAxes.length; n++) {
        node = nodesAxes[n];
        y = node.y;
        z = node.z;
        node.y = y * cosTheta - z * sinTheta;
        node.z = z * cosTheta + y * sinTheta;
    }	
};





function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
};

