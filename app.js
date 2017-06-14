var express = require('express');
var app = express();
var serv = require('http').Server(app);
var port = 149;
var io = require('socket.io')(serv, {});
var deltaT = 1000/60;

var SOCKET_LIST = {};

var CURVE_LIST = {};

var curve = function(r, g, b, lines, id, owner){ //This is the generic curve object, containing a time of creation
    var self = {
        lineSegmentList: lines,
        colorR: r,
        colorG: g,
        colorB: b,
        opacity: 1,
        color: "rgba(" + r + ", " + g + ", " + b + ", " + 1 + ")",
        ID: id,
        ownerID: owner,
    }
    self.update = function(){ //This function is called every tick and basically just decreases the opacity of every curve.
        self.opacity -= 0.00005 * deltaT;
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

    
    
    //These next four lines generate an RGBA value that is randomly assigned when a user connects to the server.
    var colorR = Math.floor(Math.random()*255);
    var colorG = Math.floor(Math.random()*255);
    var colorB = Math.floor(Math.random()*255);
    var rgbaColor = "rgba(" + colorR + ", " + colorG + ", " + colorB + ", " + 1 + ")";
    
    //These next four lines create a random ID for the user, sets his contribution count to 0, assign him a color, and add him to the list of sockets connected to the server.
    socket.id = Math.floor(Math.random()*100000);
    socket.contributions = 0;
    socket.color = rgbaColor;
    socket.toRemove = false;
    SOCKET_LIST[socket.id] = socket;
    

    socket.emit('connectionResponse', rgbaColor); // The server sends a package containing the user's color to the user, so that the client knows which color to use for their own curves.
    console.log("Connection from " + socket.id + ". " + numberOfObjects(SOCKET_LIST) + " users currently online.");

    
    socket.on('curveUpdate', function(data){ // This is executed when the server receives a package from a client with a new curve to be added to the list.
        
        var id = Math.floor(Math.random()*1000000);
        var c = curve(colorR, colorG, colorB, data, id, socket.id);
        CURVE_LIST[id] = c; // Add the curve to the master list of curves
        
    });
    
    socket.on('colorUpdate', function(data){
        colorR = data.red;
        colorG = data.green;
        colorB = data.blue;
    })
    
    socket.on('disconnect', function(){ //This is executed when a socket disconnects, so the server doesn't send packages to sockets that don't exist anymore.
        socket.toRemove = true; //We don't want to remove a user from the contributor list unless all of his curves have faded, so we need to keep him in the socket_list until then.
    });
});

var removeUser = function(socketID){

    delete SOCKET_LIST[socketID];
    console.log(socketID + " disconnected and has no curves left. " + numberOfObjects(SOCKET_LIST) + " users currently online.")
}

var numberOfObjects = function(list){
    var count = 0;
    for(var i in list){
        count++;
    }
    return count;
}

setInterval(function(socket){ // This is a function that is called every 'tick'.
    
    for(var i in CURVE_LIST){ //This loop updates every curve in the curve list (essentially just decreasing the opacity)
        var c = CURVE_LIST[i];
        c.update();
    }
    for(var i in SOCKET_LIST){ //This loop sends a package with the now updated curve list to every socket currently connected to the server.
        var socket = SOCKET_LIST[i];
        socket.emit('opacityUpdate', CURVE_LIST); 

        socket.contributions = 0; //This counts the user's active curves on the canvas. If he has disconnected and has no curves, he is removed from the socket list.
        for(var i in CURVE_LIST){
            if(CURVE_LIST[i].ownerID == socket.id){
                socket.contributions++;
            }
        }
        if(socket.contributions == 0 && socket.toRemove){
            removeUser(socket.id);
        }
    }
 }, deltaT);

