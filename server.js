var socketIO = require('socket.io');
var io = socketIO();
var config = require('./config');

var server = function() {
  var userlist = {};
  var messages = [];
  var playback_length = 10; //number of messages to playback on join

  io.on('connection', function(socket) {
    socket.on('add user', function(username){
      socket.username = username; //storing username in socket for testing
      userlist[username] = { // add username to userlist
        //'typing' : false, not sure if this is an important property
        'away' : false
      };
      console.log(username + ' connected');
      socket.emit('send config', config);
      socket.emit('update', 'SERVER', config.motd); // remove if needed?
      socket.emit('update', 'SERVER', ' you have connected');
      socket.broadcast.emit('update', 'SERVER', username + ' has connected');
      if(messages.length) socket.emit('playback', messages);
      io.emit('update users', userlist);
    });

    socket.on('send message', function(data) {
      var msg = '<' + socket.username + '>: ' + data; //unformatted raw string for playback
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

    socket.on("away", function(data) {
      io.emit("is away", {is_away: data , username: socket.username}, config);
      if(data) {
        socket.emit('update', 'SERVER', ' you are now away');
        userlist[socket.username].away = true;
      } else {
        socket.emit('update', 'SERVER', ' you are no longer away');
        userlist[socket.username].away = false;
      }
    });
  });
  return io;
};

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = server;