define(['socket', 'user'], function(socket, user) {
	socket.on('connect', function(data) {
		socket.emit('board.join', {id: boardId, user: user.name} );
		if (user.name) user.hasSetName = true;
		user.id = socket.socket.sessionid;
	});
	
	socket.on('connect_failed', function(reason) {
		console.log("Not authorised to see this board. Redirect to login.");
		document.location.href = "/login/" + boardId;
	});
})
