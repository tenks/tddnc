var socketIO = require('socket.io');
var io = socketIO();
var Chance = require('chance');


var socketInit = function() {
  var userlist = {};
  var messages = [];
  var playback_length = 50; //number of messages to playback on join
  var chance = new Chance();

  io.on('connection', function(socket) {   
    var username = chance.name();
    socket.username = username; //storing username in socket for testing
    userlist[username] = username; //add username to userlist
    console.log(username+' connected');
    socket.emit('update', 'SERVER', ' you have connected');
    socket.broadcast.emit('update', 'SERVER', username+' has connected');
    if(messages.length) socket.emit('playback', messages);
    io.emit('update users', userlist);

    socket.on('send message', function(data) {
      var msg = '<'+socket.username+'>: '+data; //unformatted raw string for playback
      messages.push(msg);
      console.log(msg);
      if(messages.length > playback_length) 
        messages.splice(0, 1);

      data = htmlEntities(data); //prevent user from adding dom elements in their messages
      io.emit('update', socket.username, data);
    });

    socket.on('disconnect', function() {
      console.log('a user disconnected');
      delete userlist[socket.username];
      io.emit('update users', userlist);
      io.emit('update', 'SERVER', socket.username+' has disconnected');
    });
  });
  return io;
};

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = socketInit;