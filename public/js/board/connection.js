define(['socket', 'user', 'util/notification', '../board'],
    function(socket, user, notification, board) {

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
    	user.id = socket.socket.sessionid;
    	notification.add(
    		"Error caused by bad connection, this is automatically "
    		    + "being fixed. Please try again",
    		"info"
        ); 	
    });
    
    socket.on('reconnecting', function() {
    	console.log('Connection connecting');
    	user.id = socket.socket.sessionid;
    });
    
    socket.on('board.grid.size', function(size) {
    	if (!boardConfig.grid) boardConfig.grid = { position: 'none', size: 'none'};
    	boardConfig.grid.size = size;
    	board.setSizeGrid(size);
    	if (size != 'none') {
    	    notification.add('Card size changes now in ' + size + ' increments', 'info');
    	} else {
    		notification.add('Card size changes are now free form', 'info');
    	}
    });
    
    socket.on('board.grid.position', function(position) {
    	if (!boardConfig.grid) boardConfig.grid = { position: 'none', size: 'none'};
    	boardConfig.grid.position = position;
    	board.setPositionGrid(position);
    	if (position != 'none') {
    	    notification.add('Card position changes now on ' + position + ' grid', 'info');
    	} else {
    		notification.add('Card position changes are now free form', 'info');
    	}
    });
})
