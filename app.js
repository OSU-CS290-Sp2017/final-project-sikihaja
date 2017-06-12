var express = require('express');
var app = express();
var serv = require('http').Server(app);
var port = 149;
var io = require('socket.io')(serv, {});
var deltaT = 1000/20;
var timeStamp = 0;

var SOCKET_LIST = {};

var CURVE_LIST = {};

var curve = function(time, r, b, g, lines, id){
    var self = {
        timeOfCreation: time,
        timeOfLastUpdate: time,
        lineSegmentList: lines,
        colorR: r,
        colorB: b,
        colorG: g,
        opacity: 1,
        color: "rgba(" + r + ", " + b + ", " + g + ", " + 1 + ")",
        ID: id,
    }
    self.update = function(){
        self.opacity -= 0.005;
        self.color = "rgba(" + self.colorR + ", " + self.colorG + ", " + self.colorB + ", " + self.opacity + ")";
        self.timeOfLastUpdate = timeStamp;
        
        if(self.opacity < 0){
            delete CURVE_LIST[self.ID];
        }
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
    
    
    var colorR = Math.floor(Math.random()*200);
    var colorG = Math.floor(Math.random()*200);
    var colorB = Math.floor(Math.random()*200);
    var rgbaColor = "rgba(" + colorR + ", " + colorG + ", " + colorB + ", " + 1 + ")";

    socket.emit('connectionResponse', rgbaColor);

    console.log("Connection from " + socket.id + ".");
    
    
    
    
    socket.on('curveUpdate', function(data){
        
        var id = Math.floor(Math.random()*1000000);
        
        var c = curve(timeStamp, colorR, colorG, colorB, data, id);
        
        CURVE_LIST[id] = c;
        
    });
    
    
});

setInterval(function(socket){ // This is a function that is called every 'tick' (currently 40x per second)
    
    timeStamp++; //This is a timestamp that records the amount of ticks since the server was started.
    for(var i in CURVE_LIST){
        var c = CURVE_LIST[i];
        c.update();
    }
    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('opacityUpdate', CURVE_LIST); 
    }

 }, deltaT);

