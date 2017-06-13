var express = require('express');
var app = express();
var serv = require('http').Server(app);
var port = 149;
var io = require('socket.io')(serv, {});
var deltaT = 1000/20;
var timeStamp = 0;

var SOCKET_LIST = {};

var CURVE_LIST = {};

var curve = function(time, r, g, b, lines, id){ //This is the generic curve object, containing a time of creation
    var self = {
        lineSegmentList: lines,
        colorR: r,
        colorG: g,
        colorB: b,
        opacity: 1,
        color: "rgba(" + r + ", " + g + ", " + b + ", " + 1 + ")",
        ID: id,
    }
    self.update = function(){ //This function is called every tick and basically just decreases the opacity of every curve.
        self.opacity -= 0.005;
        self.color = "rgba(" + self.colorR + ", " + self.colorG + ", " + self.colorB + ", " + self.opacity + ")";
        
        if(self.opacity < 0){ //If the opacity drops below 0, it should be deleted from the master list so the user isn't rendering pointless invisible curves.
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

    //These next two lines create a random ID for the user and add him to the list of sockets connected to the server.
    socket.id = Math.floor(Math.random()*100000);
    SOCKET_LIST[socket.id] = socket;
    
    //These next four lines generate an RGBA value that is randomly assigned when a user connects to the server.
    var colorR = Math.floor(Math.random()*200);
    var colorG = Math.floor(Math.random()*200);
    var colorB = Math.floor(Math.random()*200);
    var rgbaColor = "rgba(" + colorR + ", " + colorG + ", " + colorB + ", " + 1 + ")";

    socket.emit('connectionResponse', rgbaColor); // The server sends a package containing the user's color to the user, so that his client-side code knows which color to draw.

    console.log("Connection from " + socket.id + ".");
    
    
    
    
    socket.on('curveUpdate', function(data){ // This is executed when the server receives a package from a client with a new curve to be added to the list.
        
        var id = Math.floor(Math.random()*1000000);
        
        var c = curve(timeStamp, colorR, colorG, colorB, data, id);
        
        CURVE_LIST[id] = c; // Add the curve to the master list of curves
        
    });
    
    
});

setInterval(function(socket){ // This is a function that is called every 'tick' (currently 40x per second)
    
    timeStamp++; //This is a timestamp that records the amount of ticks since the server was started.
    for(var i in CURVE_LIST){ //This loop updates every curve in the curve list (essentially just decreasing the opacity)
        var c = CURVE_LIST[i];
        c.update();
    }
    for(var i in SOCKET_LIST){ //This loop sends a package with the now updated curve list to every socket currently connected to the server.
        var socket = SOCKET_LIST[i];
        socket.emit('opacityUpdate', CURVE_LIST); 
    }

 }, deltaT);

