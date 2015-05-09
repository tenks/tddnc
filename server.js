var socketIO = require('socket.io');
var io = socketIO();
var Chance = require('chance');
var config = require('./config');

var server = function() {
  var userlist = {};
  var messages = [];
  var playback_length = 10; //number of messages to playback on join

  io.on('connection', function(socket) {   
    socket.on('add user', function(username){
      socket.username = username; //storing username in socket for testing
      userlist[username] = username; //add username to userlist
      console.log(username+' connected');
      socket.emit('update', 'SERVER', ' you have connected', config);
      socket.broadcast.emit('update', 'SERVER', username+' has connected');
      if(messages.length) socket.emit('playback', messages);
      io.emit('update users', userlist);
    });

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

    socket.on("typing", function(data) {
      io.emit("is typing", {is_typing: data , username: socket.username});
    });
  });
  return io;
};

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = server;