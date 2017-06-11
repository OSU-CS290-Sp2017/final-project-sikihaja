var board = document.getElementById('board');
var ctx = board.getContext('2d');
var lastX;
var lastY;
var draw = false;
var socket = io();

board.addEventListener('mousedown', function(e){
	console.log("mouse has been clicked on the board");
    draw = true;
});
board.addEventListener('mouseup', function(e){
	console.log("mouse has been unclicked on the board");
	draw = false;
});
board.addEventListener('mouseleave', function(e){
	console.log("mouse has left the board");
	draw = false;
});

board.addEventListener('mousemove', function(e){
    if(!draw){
        lastX = e.clientX;
        lastY = e.clientY;
    }
    if(draw){
        
        /*ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.clientX, e.clientY);
        ctx.strokeStlye = '#ff0000';
        ctx.stroke();*/
        
        var pack = {
            xInitial: lastX,
            yInitial: lastY,
            xFinal: e.clientX,
            yFinal: e.clientY,
        }
        socket.emit('lineUpdate', pack);

        lastX = e.clientX;
        lastY = e.clientY;
    }

});


socket.on('generalUpdate', function(lines){
    var counter = 0;
    for(var i in lines){
        counter++;
        var line = lines[i];
        
        ctx.beginPath();
        ctx.strokeStyle = lines[i].color;
        ctx.moveTo(lines[i].xInitial, lines[i].yInitial);
        ctx.lineTo(lines[i].xFinal, lines[i].yFinal);
        ctx.stroke();
    }
    console.log(counter + " lines.");
});

