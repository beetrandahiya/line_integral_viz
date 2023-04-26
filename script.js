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
var rotx = 300 * Math.PI / 180;
var roty = 25 * Math.PI / 180;
var rotz = 0 * Math.PI / 180;

var nodes = [];
var nodes_2D = [];


var nodesAxes = [];

var cont = document.getElementById('container');
// Obtain a reference to the canvas element.
var canvas = document.getElementById("myCanvas");
// Obtain a 2D context from the canvas element.
var cxt = canvas.getContext("2d");


cxt.lineCap = "round";
cxt.lineJoin = "round";
cxt.font = 'normal 16px Inter';

var node_x = math.parse(document.getElementById("fx").value);
var node_x = node_x.compile();
var node_y = math.parse(document.getElementById("fy").value);
var node_y = node_y.compile();
var node_z = math.parse(document.getElementById("fz").value);
var node_z = node_z.compile();

var tmin = math.evaluate(document.getElementById("tmin").value);

var tmax = math.evaluate(document.getElementById("tmax").value);


document.getElementById("fx").addEventListener("input", function () {
    node_x = math.parse(document.getElementById("fx").value);
    node_x = node_x.compile();
    drawFunction();
});
document.getElementById("fy").addEventListener("input", function () {
    node_y = math.parse(document.getElementById("fy").value);
    node_y = node_y.compile();
    drawFunction();
});
document.getElementById("fz").addEventListener("input", function () {
    node_z = math.parse(document.getElementById("fz").value);
    node_z = node_z.compile();
    drawFunction();
});
document.getElementById("tmin").addEventListener("input", function () {
    tmin = math.evaluate(document.getElementById("tmin").value);
    drawFunction();
});
document.getElementById("tmax").addEventListener("input", function () {
    tmax = math.evaluate(document.getElementById("tmax").value);
    console.log(tmax);
    drawFunction();
});

sizeCanvas();

// *** Mouse rotate. ***	
var mouseX = 0,
    mouseY = 0,
    pmouseX, pmouseY; // mouseX is current mouse x-coordinate, pmouseX is previous mouse x-coordinate when it was 1 pixel different.  
// Figure must rotate iff mousemove AND mousedown (for mouse devices):
var mouseDown = false;
cont.addEventListener("mousedown", handleMousedown, false);
cont.addEventListener("touchstart", handleMousedown, false);
document.addEventListener("mouseup", function (e) {
    if (mouseDown) mouseDown = false;
    canvas.style.cursor = "grab";
}, false);
cont.addEventListener("mousemove", handleMove, false);
cont.addEventListener("touchmove", handleMove, false);

//Zoom with mouse wheel
canvas.addEventListener("wheel", function (e) {
    if (e.deltaY < 0) {
        scale *= 1.1;
    } else {
        scale /= 1.1;
    }
    drawFunction();
    e.preventDefault();
});



function handleMousedown(e) {
    if (!mouseDown) mouseDown = true;
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
    if (Math.abs(x - pmouseX) >= 1) {
        mouseX = x;
    } else {
        mouseX = pmouseX
    }
    if (Math.abs(y - pmouseY) >= 1) {
        mouseY = y;
    } else {
        mouseY = pmouseY
    }

    // change rotation
    //if(e.which==1 || e.buttons==1) {
    if (mouseDown === true) {
        rotx = rotx + (mouseY - pmouseY) / sensetivity;
        roty = roty + (mouseX - pmouseX) / sensetivity;
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
    cxt.translate(canvas.width / 2, canvas.height / 2);
};
 

function drawFunction() {

    //start performance timer
    var t0 = performance.now();

    cxt.clearRect(-canvas.width, -canvas.height, 2 * canvas.width, 2 * canvas.height);

    function fx(t) {
        return node_x.evaluate({
            t: t
        });
    }

    function fy(t) {
        return node_y.evaluate({
            t: t
        });

    }

    function fz(x, y) {
        return node_z.evaluate({
            x: x,
            y: y
        });
    }

    var i = 0;
    var dt = 0.01;
    var z_d = 1; // move the center of the graph along z-axis
    var S=0 // value of the line integral
    for (var t = tmin; t <= tmax; t += dt) {
        nodes[i] = {
            x: fx(t),
            y: fy(t),
            z: fz(fx(t), fy(t)) - z_d
        };
        nodes_2D[i] = {
            x: nodes[i].x,
            y: nodes[i].y,
            z: -z_d
        };
        if (i > 0) {
            var dx=nodes[i].x-nodes[i-1].x;
            var dy=nodes[i].y-nodes[i-1].y;
            S+=Math.sqrt(dx**2+dy**2)*((nodes[i].z+nodes[i-1].z+2*z_d)/2);
        }
        ++i;
    }
    //end performance timer
    var t1 = performance.now();
    console.log("Call to eval took " + (t1 - t0) + " milliseconds.");

    var t0 = performance.now();


    nodesAxes[0] = {
        x: 0,
        y: 0,
        z: -z_d
    };
    nodesAxes[1] = {
        x: xMax,
        y: 0,
        z: -z_d
    };
    nodesAxes[2] = {
        x: 0,
        y: yMax,
        z: -z_d
    };
    nodesAxes[3] = {
        x: 0,
        y: 0,
        z: xMax - z_d
    };

    // rotate nodes
    rotateX3D(rotx);
    rotateY3D(roty);
    rotateZ3D(rotz);

    // draw axes
    cxt.strokeStyle = "black";
    cxt.lineWidth = 1;
    cxt.font = 'normal 14px Inter';
    cxt.beginPath();
    cxt.moveTo(nodesAxes[0].x * scale, nodesAxes[0].y * scale);
    cxt.lineTo(nodesAxes[1].x * scale, nodesAxes[1].y * scale);
    cxt.stroke();
    cxt.fillText('x', nodesAxes[1].x * scale, nodesAxes[1].y * scale);
    cxt.beginPath();
    cxt.moveTo(nodesAxes[0].x * scale, nodesAxes[0].y * scale);
    cxt.lineTo(nodesAxes[2].x * scale, nodesAxes[2].y * scale);
    cxt.stroke();
    cxt.fillText('y', nodesAxes[2].x * scale, nodesAxes[2].y * scale);
    cxt.beginPath();
    cxt.moveTo(nodesAxes[0].x * scale, nodesAxes[0].y * scale);
    cxt.lineTo(nodesAxes[3].x * scale, nodesAxes[3].y * scale);
    cxt.stroke();
    cxt.fillText('z', nodesAxes[3].x * scale, nodesAxes[3].y * scale);




    // draw figure
    cxt.beginPath();
    for (var i = 0; i < nodes.length; i++) {
        cxt.strokeStyle = "#918fff"
        cxt.lineWidth = 4;
        var px = nodes[i].x;
        var py = nodes[i].y;
        cxt.lineTo(px * scale, py * scale);

        /* For coloring the line segments
         if(i<nodes.length-1){
              var px2 = nodes[i+1].x;
          var py2 = nodes[i+1].y;
          cxt.lineTo(px2*scale,py2*scale);
          }*/
    }
    cxt.stroke();

    //draw 2D projection
    cxt.beginPath();
    for (var i = 0; i < nodes_2D.length; i++) {
        cxt.strokeStyle = "#000"
        cxt.lineWidth = 2;
        var px = nodes_2D[i].x;
        var py = nodes_2D[i].y;
        cxt.lineTo(px * scale, py * scale);
    }
    cxt.stroke();

    //draw rectangle from 2D projection to 3D
    for (var i = 0; i < nodes.length; i++) {
        //draw line from 2D projection to 3D
        cxt.beginPath();
        cxt.strokeStyle = "#918fff33"
        cxt.lineWidth = 2;
        var px = nodes_2D[i].x;
        var py = nodes_2D[i].y;
        cxt.lineTo(px * scale, py * scale);
        var px2 = nodes[i].x;
        var py2 = nodes[i].y;
        cxt.lineTo(px2 * scale, py2 * scale);
        cxt.stroke();
    }
    //end performance timer
    var t1 = performance.now();
    console.log("Call to draw took " + (t1 - t0) + " milliseconds.")

    //write the value of the line integral
    document.getElementById("li_val").innerHTML = "Line integral: " + S.toFixed(4);


};


// Rotate shape around the z-axis, i.e. the non-rotated axis, perpendicular to the screen.
function rotateZ3D(theta) {
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);


    for (var n = 0; n < nodes.length; n++) {
        var node = nodes[n];
        var x = node.x;
        var y = node.y;
        node.x = x * cosTheta - y * sinTheta;
        node.y = y * cosTheta + x * sinTheta;
    }
    for (n = 0; n < nodesAxes.length; n++) {
        node = nodesAxes[n];
        x = node.x;
        y = node.y;
        node.x = x * cosTheta - y * sinTheta;
        node.y = y * cosTheta + x * sinTheta;
    }

    //do the same for the 2D projection
    for (var n = 0; n < nodes_2D.length; n++) {
        var node = nodes_2D[n];
        var x = node.x;
        var y = node.y;
        node.x = x * cosTheta - y * sinTheta;
        node.y = y * cosTheta + x * sinTheta;
    }


};

// Rotate shape around the y-axis, i.e. the non-rotated axis, vertical to the screen.
function rotateY3D(theta) {
    var sinTheta = Math.sin(-theta);
    var cosTheta = Math.cos(-theta);


    for (var n = 0; n < nodes.length; n++) {
        var node = nodes[n];
        var x = node.x;
        var z = node.z;
        node.x = x * cosTheta - z * sinTheta;
        node.z = z * cosTheta + x * sinTheta;
    }
    for (n = 0; n < nodesAxes.length; n++) {
        node = nodesAxes[n];
        x = node.x;
        z = node.z;
        node.x = x * cosTheta - z * sinTheta;
        node.z = z * cosTheta + x * sinTheta;
    }

    //do the same for the 2D projection
    for (var n = 0; n < nodes_2D.length; n++) {
        var node = nodes_2D[n];
        var x = node.x;
        var z = node.z;
        node.x = x * cosTheta - z * sinTheta;
        node.z = z * cosTheta + x * sinTheta;
    }
};

// Rotate shape around the x-axis, i.e. the non-rotated axis, horizontal to the screen.
function rotateX3D(theta) {
    var sinTheta = Math.sin(-theta);
    var cosTheta = Math.cos(-theta);


    for (var n = 0; n < nodes.length; n++) {
        var node = nodes[n];
        var y = node.y;
        var z = node.z;
        node.y = y * cosTheta - z * sinTheta;
        node.z = z * cosTheta + y * sinTheta;
    }
    for (n = 0; n < nodesAxes.length; n++) {
        node = nodesAxes[n];
        y = node.y;
        z = node.z;
        node.y = y * cosTheta - z * sinTheta;
        node.z = z * cosTheta + y * sinTheta;
    }

    //do the same for the 2D projection
    for (var n = 0; n < nodes_2D.length; n++) {
        var node = nodes_2D[n];
        var y = node.y;
        var z = node.z;
        node.y = y * cosTheta - z * sinTheta;
        node.z = z * cosTheta + y * sinTheta;
    }


};





function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};