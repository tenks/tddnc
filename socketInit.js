var socketIO = require('socket.io');
var Chance = require('chance');
var io = socketIO();
var chance = new Chance();

var socketInit = function() {
  io.on('connection', function(socket) {

    var name = chance.name();

    console.log('a user connected');
    io.emit('chat message', 'a user connected');
    io.emit('user online', name);

    socket.on('disconnect', function() {
      console.log('a user disconnected');
      io.emit('chat message', 'a user disconnected');
      io.emit('user offline', name);
    });

    socket.on('chat message', function(msg) {
      console.log('message: ' + msg);
      io.emit('chat message', msg);
    });

  });
  return io;
};

module.exports = socketInit;