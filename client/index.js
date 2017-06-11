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
        }
        
        ctx.beginPath();
        ctx.strokeStyle = "gray";
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
  min = Math.ceil(1);
  max = Math.floor(7);
  ctx.lineWidth = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(ctx.lineWidth);
});


socket.on('generalUpdate', function(curveList){
    var largestTimeStamp = 0;
    for(var i in curveList){
        var curve = curveList[i];
        if(curve.timeOfCreation > largestTimeStamp){
            largestTimeStamp = curve.timeOfCreation;
        }
        if(curve.timeOfCreation > timeStamp){
            for(var j in curve.lineSegmentList){
                var lineSegment = curve.lineSegmentList[j];
                ctx.beginPath();
                ctx.strokeStyle = curve.color;
                ctx.moveTo(lineSegment.xInitial, lineSegment.yInitial);
                ctx.lineTo(lineSegment.xFinal, lineSegment.yFinal);
                ctx.stroke();
            }
        }
    }
    timeStamp = largestTimeStamp;
});
