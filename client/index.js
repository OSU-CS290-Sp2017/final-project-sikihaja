var board = document.getElementById('board');
var ctx = board.getContext('2d');
var button = document.getElementById('thicc-button');
var lastX;
var lastY;
var draw = false;
var socket = io();
var timeStamp = 0;
var newUpdate = false;
var myColor;
var myWidth = 1;

var oldWidths = []; //should only hold the 3 last widths
oldWidths.push(ctx.lineWidth);

var CURVE = {};


board.addEventListener('mousedown', function(e){
    recordSegments = true;
    draw = true;
});
board.addEventListener('mouseup', function(e){
    newUpdate = true;
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
        var pack = {
            xInitial: lastX - rect.left,
            yInitial: lastY - rect.top,
            xFinal: e.clientX - rect.left,
            yFinal: e.clientY - rect.top,
            ID: Math.floor(Math.random()*100000),
            width: myWidth,
        }

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
        socket.emit('curveUpdate', CURVE);
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


socket.on('connectionResponse', function(data){
    myColor = data;
});
    
socket.on('opacityUpdate', function(curveList){
    if(!draw){
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
