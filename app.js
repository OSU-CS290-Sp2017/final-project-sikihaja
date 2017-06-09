var express = require('express');
var app = express();
var serv = require('http').Server(app);
var port = 149;
var io = require('socket.io')(serv, {});
var deltaT = 1000/40;

app.use('/client', express.static(__dirname + '/client'));

serv.listen(port);
console.log("Server started on port " + port);


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});



var SOCKET_LIST = {};

io.sockets.on('connection', function(socket){
    
    socket.id = Math.floor(Math.random()*100000);
    
    //Hex color selection
    
});

setInterval(function(){
    
    //Update stuff here
    
 }, deltaT);

