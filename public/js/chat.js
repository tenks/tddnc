/* initialize variables */
var socket = io();
var typing = false; // user is typing
var away = false; // user is away
var typing_time = undefined; // time after last keypress where user will be 'typing' in ms
var autoaway_time = undefined; // time user has before auto away in minutes
var typingtimeout = undefined; // timeout for typing
var awaytimeout = undefined; // timeout for auto away

/* initialize and store config variables */
socket.on('send config', function(config) {
	autoaway_time = config.autoaway_time;
	typing_time = config.typing_time;
	awaytimeout = setTimeout(away_timeout, (autoaway_time * 1000 * 60)); // start timer upon entering
});

/* functions */
function typing_timeout() {
	typing = false;
	socket.emit("typing", false);
}

function away_timeout() {
	away = true;
	socket.emit("away", true);
}

function update_typing(is_typing, username) {
	var username_hook = $('#online').find($('li:contains(' + username + ')'));
	if(is_typing) 
		username_hook.append(' <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>');
	else 
		username_hook.find('.glyphicon-pencil').remove();
}

/* frontend events */
$(document).ready(function() {
	$('#m').val('');
	$('#m').focus();
	$('#messages').perfectScrollbar();

	socket.on('connect', function() {
		socket.emit('add user');
	});

	$('#m').keypress(function(e) {
		if (e.which !== 13) {
			if($('#m').is(":focus") && typing === false) {
				typing = true;
				socket.emit("typing", true);
			} 
			if(away === true) {
				away = false;
				socket.emit("away", false);
			}
			/* clear timeouts */
			clearTimeout(typingtimeout);
			typingtimeout = setTimeout(typing_timeout, typing_time);
			clearTimeout(awaytimeout);
			awaytimeout = setTimeout(away_timeout, (autoaway_time * 1000 * 60));
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

/* socket events */
socket.on("is typing", function(data) {
	update_typing(data.is_typing, data.username);
});

socket.on('update', function(username, data) {
	update_typing(false, username); typing = false;
	$('#messages').append('<li><b style="color:"#'+data.color+'">' + username + '</b>: ' + data + '</li>');
	$('#messages').scrollTop(100000)
	$('#messages').perfectScrollbar('update');
});

socket.on('update users', function(data) {
	$('#online').empty();
	$.each(data, function(key, value) {
		if(data[key].away)
			$('#online').append('<li><b style="color:#'+data[key].color+'">'+key+'</b> <span class="glyphicon glyphicon-time" aria-hidden="true"></span></li>');
		else
			$('#online').append('<li><b style="color:#'+data[key].color+'">'+key+'</b></li>');
	});
});

socket.on('playback', function(data) {
	$('#messages').append($('<li>').text('====PLAYBACK===='));
	$.each(data, function(key, value) {
		$('#messages').append($('<li>').text(value));
	});
	$('#messages').append($('<li>').text('==PLAYBACK END=='));
})

socket.on('redirect', function() {
	window.location.href = "http://localhost/uushii/tddnc/chat.php";
});