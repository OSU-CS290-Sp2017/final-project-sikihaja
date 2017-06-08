var express = require('express');
var app = express();
var serv = require('http').Server(app);
var port = 80;
var io = require('socket.io')(serv, {});


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

serv.listen(port);

console.log("Server started on port " + port);

var deltaT = 1000/40;

var SOCKET_LIST = {};

io.sockets.on('connection', function(socket){
    
    socket.id = Math.floor(Math.random()*100000);
    
});

setInterval(function(){
    
    //Update stuff here
    
 }, deltaT);

