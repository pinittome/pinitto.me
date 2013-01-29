define(['socket', 'user'], function(socket, user) {
    socket.on('connect', function(data) {
        console.log("Requesting to join board: " + boardId)
        socket.emit('board.join', {id: boardId, user: user.name} );
        if (user.name) user.hasSetName = true;
        user.id = socket.socket.sessionid;
    });
    
    socket.on('connect.fail', function(reason) {
        console.log("Not authorised to see this board. Redirect to login.");
        document.location.href = "/login/" + boardId;
    });
})
