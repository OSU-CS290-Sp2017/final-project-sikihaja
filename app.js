var express = require('express');
var app = express();
var serv = require('http').Server(app);
var port = 149;
var io = require('socket.io')(serv, {});
var deltaT = 1000/40;
var timeStamp = 0;

var SOCKET_LIST = {};

var CURVE_LIST = {};

var curve = function(time, c, lines){
    var self = {
        timeOfCreation: time,
        lineSegmentList: lines,
        color: c,
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



io.sockets.on('connection', function(socket){ 

    socket.id = Math.floor(Math.random()*100000);
    SOCKET_LIST[socket.id] = socket;

    var hexColor = "#" + Math.floor(Math.random()*16777215).toString(16);
    socket.emit('connectionResponse', hexColor);

    console.log("Connection from " + socket.id + ".");
    
    
    
    
    socket.on('curveUpdate', function(data){
        
        var id = Math.floor(Math.random()*1000000);
        
        var c = curve(timeStamp, hexColor, data);
        
        CURVE_LIST[id] = c;
        
    });
    
    
});

setInterval(function(socket){ // This is a function that is called every 'tick' (currently 40x per second)
    
    timeStamp++; //This is a timestamp that records the amount of ticks since the server was started.
    
    for(var i in SOCKET_LIST){ //Send the list of curves to everybody currently connected.
        var socket = SOCKET_LIST[i];
        socket.emit('generalUpdate', CURVE_LIST);
    }
 }, deltaT);

