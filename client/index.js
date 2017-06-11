var board = document.getElementById('board');
var ctx = board.getContext('2d');
var lastX;
var lastY;
var draw = false;
var socket = io();
var timeStamp = 0;

document.addEventListener('click', function(e){
    draw = !draw;
});

document.addEventListener('mousemove', function(e){
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
        }
        socket.emit('lineUpdate', pack);

        lastX = e.clientX;
        lastY = e.clientY;
    }

});


socket.on('generalUpdate', function(lines){
    
    for(var i in lines){
        var line = lines[i];
        
        ctx.beginPath();
        ctx.strokeStyle = lines[i].color;
        ctx.moveTo(lines[i].xInitial, lines[i].yInitial);
        ctx.lineTo(lines[i].xFinal, lines[i].yFinal);
        ctx.stroke();
    }
});

