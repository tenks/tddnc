var socket = io();

$(function() {
	$('form').submit(function() {
		var msg = $('#m').val();
		if(msg) {
			socket.emit('chat message', msg);
			$('#m').val('');
		}
		return false;
	});
});

socket.on('chat message', function(msg) {
   $('#messages').append($('<li>').text(msg));
});

//add to online list
socket.on('user online', function(msg) {
	$('#online').append($('<li>').text(msg));
});

//remove from online list
socket.on('user offline', function(msg) {
	var selector = ':contains('+msg+')';
	$('#online').children('li').remove(selector);
});