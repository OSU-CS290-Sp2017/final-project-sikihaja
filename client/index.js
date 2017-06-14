var board = document.getElementById('board');
var ctx = board.getContext('2d');
var button = document.getElementById('thicc-button');
var lastX;
var lastY;
var draw = false;
var socket = io();
var newUpdate = false;
var myColor;
var myWidth = 1;
var contributors = document.getElementById('contributors');

var oldWidths = []; //should only hold the 3 last widths
oldWidths.push(ctx.lineWidth);

var CURVE = {};


contributors.addEventListener('click', function(event){
	var contributor_lis = document.getElementById('contributors-ul').getElementsByClassName('contributor-li');
	for (var i = 0; i < contributor_lis.length; i++){
		contributor_lis[i].classList.toggle('hidden');
	}
	
});

board.addEventListener('mousedown', function(e){
    recordSegments = true; //If the mouse has been clicked, we should start adding line segments to the curve to be sent to the server.
    draw = true;
});
board.addEventListener('mouseup', function(e){
    newUpdate = true;//If the mouse has been unclicked, then the curve is done being drawn and we can send it to the server to be added to the master list.
	draw = false;
});
board.addEventListener('mouseleave', function(e){
	draw = false;
});



board.addEventListener('mousemove', function(e){
    var rect = board.getBoundingClientRect();

    if(!draw){
        lastX = e.clientX;
        lastY = e.clientY;
    }
    if(draw){
        var pack = { //This pack contains a complete line segment
            xInitial: lastX - rect.left,
            yInitial: lastY - rect.top,
            xFinal: e.clientX - rect.left,
            yFinal: e.clientY - rect.top,
            ID: Math.floor(Math.random()*100000),
            width: myWidth,
        }

        //The next six lines draw the curve temporarily so that the user can see what they're drawing. It will be erased after mouseup and redrawn when the server sends it out in the curve list.
        ctx.beginPath();
        ctx.lineWidth = myWidth;
        ctx.strokeStyle = myColor;
        ctx.moveTo(lastX - rect.left, lastY - rect.top);
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();

        CURVE[pack.ID] = pack;

        lastX = e.clientX;
        lastY = e.clientY;
    }
    if(newUpdate){
        socket.emit('curveUpdate', CURVE); //Send the server a package containing a curve object.
        CURVE = {};
        newUpdate = false;
    }
});

button.addEventListener('click', function(){
  var testWidth; //testing if width is in oldWidths
  do {
    var repeated = false;
    min = Math.ceil(1);
    max = Math.floor(7);
    testWidth = Math.floor(Math.random() * (max - min + 1)) + min;
    if (oldWidths.length > 3) {
      oldWidths.shift();
    }for (var i = 0; i < oldWidths.length; i++) {
      if(testWidth == oldWidths[i]){
        repeated = true;
      }
    }
  } while (repeated == true);
  oldWidths.push(testWidth);
  myWidth = testWidth;
});

function changeWidth(newWidth) {
  myWidth = newWidth;
}

socket.on('connectionResponse', function(data){
    myColor = data;
});

socket.on('opacityUpdate', function(curveList){ //When the client receives this package from the server, it needs to redraw the canvas with the updated opacities.
    if(!draw){ //However, if the user is currently drawing a curve, clearing the canvas would make it seem like the curve he's drawing is being erased. So we only clear if he's not drawing.
        ctx.clearRect(0, 0, board.width, board.height);
        for(var i in curveList){
            var curve = curveList[i];
            for(var j in curve.lineSegmentList){
                var lineSegment = curve.lineSegmentList[j];
                ctx.beginPath();
                ctx.lineWidth = lineSegment.width;
                ctx.strokeStyle = curve.color;
                ctx.moveTo(lineSegment.xInitial, lineSegment.yInitial);
                ctx.lineTo(lineSegment.xFinal, lineSegment.yFinal);
                ctx.stroke();
            }
        }
    }
});
