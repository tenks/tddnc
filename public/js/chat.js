var socket = io();
var typing = false;
var away = false;
var typingtimeout = undefined;
var awaytimeout = undefined;

$(document).ready(function() {
	var username = chance.name()
	$('#m').val('');
	$('#m').focus();
	$('#messages').perfectScrollbar();

	socket.on('connect', function() {
		socket.emit('add user', username)
	});

	$('#m').keypress(function(e) {
		if (e.which !== 13) {
			if($('#m').is(":focus") && typing === false && away === true) {
				typing = true;
				away = false;
				socket.emit("typing", true);
				socket.emit("away", false);
			} 

			clearTimeout(typingtimeout);
			typingtimeout = setTimeout(typing_timeout, 2000);
		}
	});	

	$('form').submit(function() {
		var msg = $('#m').val();
		if(msg) {
			socket.emit('send message', msg);
			$('#m').val('');
		}
		return false;
	});
});

function typing_timeout() {
	typing = false;
	socket.emit("typing", false);
}

function away_timeout() {
	away = true;
	socket.emit("away", true);
}

function update_typing(is_typing, username) {
	var username_hook = $('#online').find($(':contains('+username+')'));
	if(is_typing) 
		username_hook.append(' <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>');
	else 
		username_hook.find('span').remove();
}

function update_away(is_away, username, config) {
	var username_hook = $('#online').find($(':contains('+username+')'));
	if(is_away) 
		username_hook.addClass('italic');
	 else {
		username_hook.removeClass('italic');
		clearTimeout(awaytimeout);
		awaytimeout = setTimeout(away_timeout, (config.autoaway * 1000 * 60));
	}
}

socket.on("is typing", function(data) {
	update_typing(data.is_typing, data.username);
});

socket.on("is away", function(data, config) {
	update_away(data.is_away, data.username, config);
});

socket.on('update', function(username, data) {
	update_typing(false, username); typing = false;
	$('#messages').append('<li><b>'+username+'</b>: '+data+'</li>');
	$('#messages').scrollTop(100000)
	$('#messages').perfectScrollbar('update');
});

socket.on('send config', function(config) {
	awaytimeout = setTimeout(away_timeout, (config.autoaway * 1000 * 60));
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