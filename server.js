var socketIO = require('socket.io');
var request = require('request');
var io = socketIO(); // .listen(80);
var config = require('./config');
var apache = io.listen(80);

var server = function() {
  var userlist = {};
  var messages = [];
  var global_user = '';

  /******************************************************************************************** 
   *   
   *  APACHE TO SOCKETIO COMMUNICATION - BREAKDOWN
   *
   *  we're connecting to apache on port 80 and emit an event to send us data.
   *  beforehand we were redirected to chat.php which sends the values we're going to fetch here.
   *  and then redirects to the chat.
   *  we then define a global user var that is set to NULL after we locally stored it, that is
   *  to prevent ghosts from connecting that haven't recieved the values or have simply not used
   *  chat.php to connect. we test that by checking if the global user name is set to NULL, which
   *  ONLY happens if the user has not revieved the values from chat.php, if that is the case
   *  the socket gets destroyed and an redirect event is fired, which redirects
   *  the user back to chat.php to init the vars correctly and then get him back into the chat
   *   
   *  this does not work on hard reset of the server, which i am going to assume will not happen
   *  in prod.
   *
   ********************************************************************************************/


  /* APACHE CONNECTION */ 
  apache.on('connection', function(socket2) { 
    socket2.emit('apache request');
    socket2.on('apache response', function(data) {
      global_user = data;
    }); 
  });

  /* SOCKET CONNECTION */
  io.on('connection', function(socket) {
    socket.on('add user', function(){
      if(global_user.username == '' || global_user.username == undefined) {
        socket.emit('redirect');
        socket.disconnect();
      } else {
        socket.broadcast.emit('update', 'SERVER', global_user.username + ' has connected');
      }
      user = global_user; //save vars locally
      socket.username = user.username; //storing username in socket for testing
      console.log(user.username + ' connected');
      
      userlist[user.username] = { // add username to userlist
        //'typing' : false, not sure if this is an important property
        'away'  : false,
        'color' : user.username_color
      };

      global_user.username = ''; //reset var to prevent ghosts
      socket.emit('send config', config);
      socket.emit('update', 'SERVER', config.motd); // remove if needed?
      socket.emit('update', 'SERVER', ' you have connected');

      if(messages.length) socket.emit('playback', messages);
      io.emit('update users', userlist);    
    });

    socket.on('send message', function(data) {
      var msg = '<' + socket.username + '>: ' + data; //unformatted raw string for playback
      messages.push(msg);
      console.log(msg);
      if(messages.length > config.playback) 
        messages.splice(0, 1);
      data = htmlEntities(data); //prevent user from adding dom elements in their messages
      io.emit('update', socket.username, data);
    });

    socket.on('disconnect', function() {
      console.log('a user disconnected');
      delete userlist[socket.username];
      io.emit('update users', userlist);
      if(socket.username !== '' && socket.username !== undefined) {
        io.emit('update', 'SERVER', socket.username+' has disconnected');
      }
    });

    socket.on("typing", function(data) {
      io.emit("is typing", {is_typing: data , username: socket.username});
    });

    socket.on("away", function(data) {
      userlist[socket.username].away = data;
      io.emit('update users', userlist);
      if(data)
        socket.emit('update', 'SERVER', ' you are now away');
      else
        socket.emit('update', 'SERVER', ' you are no longer away');
    });
  });
  return io;
};

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = server;
