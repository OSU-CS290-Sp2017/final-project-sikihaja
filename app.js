var express = require('express');
var app = express();
var serv = require('http').Server(app);
var port = 149;
var io = require('socket.io')(serv, {});
var deltaT = 1000/40;
var timeStamp = 0;

var curve = function(timeOfCreation, color, opacity){
    var self = {
        
    }
}

var lineSegment = function(xi, yi, xf, yf, c, ID, t){
    var self = {
        xInitial: xi,
        yInitial: yi,
        xFinal: xf,
        yFinal: yf,
        color: c,
        id: ID,
        time: t,
    }
    return self;
}

app.use('/client', express.static(__dirname + '/client'));

serv.listen(port);
console.log("Server started on port " + port);


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.get('/index.js', function(req, res){
    res.sendFile(__dirname + '/client/index.js');
});


var SOCKET_LIST = {};

var LINE_SEGMENT_LIST = {};

io.sockets.on('connection', function(socket){

    socket.id = Math.floor(Math.random()*100000);
    
    console.log("Connection from " + socket.id + ".");
    
    var hexColor = "#" + Math.floor(Math.random()*16777215).toString(16);
    
    SOCKET_LIST[socket.id] = socket;
    
    socket.on('lineUpdate', function(data){
        
        var id = Math.floor(Math.random()*1000000);
        
        line = lineSegment(data.xInitial, data.yInitial, data.xFinal, data.yFinal, hexColor, id);
        
        LINE_SEGMENT_LIST[id] = line;
        
    });
    
    //Hex color selection
    
});

setInterval(function(socket){
    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('generalUpdate', LINE_SEGMENT_LIST);
    }
 }, deltaT);

