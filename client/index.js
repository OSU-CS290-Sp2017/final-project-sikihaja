var board = document.getElementById('board');
var ctx = board.getContext('2d');
var lastX;
var lastY;
var draw = false;

document.addEventListener('click', function(e){
    draw = !draw;
});

document.addEventListener('mousemove', function(e){
    if(!draw){
        lastX = e.clientX;
        lastY = e.clientY;
    }
    if(draw){
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.clientX, e.clientY);
        ctx.strokeStlye = '#ff0000';
        ctx.stroke();

        lastX = e.clientX;
        lastY = e.clientY;
    }

});

var lineSegment = function(xi, yi, xf, yf){
    var self = {

    }
}
