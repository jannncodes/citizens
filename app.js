const express = require('express')
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const world = require('./js/server_world');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/js/client_world.js', function(req, res){
  res.sendFile(__dirname + '/js/client_world.js');
});
app.get('/assets/:file', function(req, res){
  res.sendFile(__dirname + '/js/assets/' + req.params.file);
});


// Handle connection
io.on('connection', function(socket){
  const id = socket.id;
  console.log(id, 'connected');

  var player = world.addPlayer(id);
  socket.emit('createPlayer', player);

  socket.broadcast.emit('addOtherPlayer', player);

  socket.on('requestOldPlayers', function () {
    world.players.forEach(function(eachPlayer){
      if (eachPlayer.playerId !== id) socket.emit('addOtherPlayer', eachPlayer);
    });
  });

  socket.on('updatePosition', function(data) {
    var newData = world.updatePlayerData(data);
    socket.broadcast.emit('updatePosition', newData);
  });

  socket.on('disconnect', function(){
      console.log(id, 'disconnected');
      io.emit('removeOtherPlayer', player);
      world.removePlayer(player);
  });

});

// Handle server

http.listen(3000, function(){
    console.log( 'Listening on port 3000' );
});
