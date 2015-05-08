var socket = io();

$(document).ready(function() {
	$('form').submit(function() {
		var msg = $('#m').val();
		if(msg) {
			socket.emit('send message', msg);
			$('#m').val('');
		}
		return false;
	});
});

socket.on('update', function(username, data) {
	$('#messages').append('<li><b>'+username+'</b>: '+data+'</li>');
});

socket.on('update users', function(data) {
	$('#online').empty();
	$.each(data, function(key, value) {
		$('#online').append($('<li>').text(key));
	});
});

socket.on('playback', function(data) {
	$('#messages').append($('<li>').text('====PLAYBACK===='));
	$.each(data, function(key, value) {
		$('#messages').append($('<li>').text(value));
	});
	$('#messages').append($('<li>').text('==PLAYBACK END=='));
})