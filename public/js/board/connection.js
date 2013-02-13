define(['socket', 'user', 'util/notification'], function(socket, user, notification) {
    socket.on('connect', function(data) {
        console.log("Requesting to join board: " + boardId)
        socket.emit('board.join', {id: boardId, user: user.name});
        if (user.name) user.hasSetName = true;
        user.id = socket.socket.sessionid;
    });
    
    socket.on('connect.fail', function(reason) {
        console.log("Not authorised to see this board. Redirect to login.");
        document.location.href = "/login/" + boardId;
    });
    
    socket.on('reconnect', function() {
    	console.log('Connection reconnected');
    	socket.emit('board.join', {id: boardId, user: user.name});
    	user.id = socket.socket.sessionid;
    });

    socket.on('board.request-join', function() {
    	console.log('Server has requested board join');
    	socket.emit('board.join', {id: boardId, user: user.name});
    	user.id = socket.socket.sessionid;
    	notification.add("Error caused by bad connection, this is automatically being fixed. Please try again", "warning"); 	
    });
    
    socket.on('reconnecting', function() {
    	console.log('Connection connecting');
    	socket.emit('board.join', {id: boardId, user: user.name});
    	user.id = socket.socket.sessionid;
    });
})
