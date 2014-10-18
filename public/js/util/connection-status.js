define(['socket', 'user', 'jquery'], function(socket, user) {

    var connectionAttempts = 0
    var open = false

    var connectionCheck = setInterval(function() {
    	console.log('Attempting board connection')
        ++connectionAttempts
    	socket.emit('board.join', {id: boardId, user: user.name})
    }, 1500)
   
    socket.on('connect.fail', function(error) {
        console.error(error)
        window.location.href = '/?id=' + boardId + '#login'
    })
 
    var openConnectionStatusModal = function() {
        try {
            $('#connection-status-modal').popup('open')
        } catch(e) {
            return
        }
        open = true
    }
    openConnectionStatusModal()
    
    var closeConnectionStatusModal = function() {
        if (false === open) return
        $('#connection-status-modal').popup('close')
        open = false
    }
    var setConnectionStatus = function(message, status) {            
        $('#connection-status-modal').addClass(status);
        $('#connection-status-modal').find('.status-message').html(message);
        switch (status) {
            case 'connected':
                return setTimeout(closeConnectionStatusModal, 1000);
            case 'connecting':
                openConnectionStatusModal();
                break;
            case 'offline':
                openConnectionStatusModal();
                break;
        }    
    }
    var connectionStatus = function(status) {
         switch (status) {
             case 'offline':
                 return setConnectionStatus("Looks like your internet connection is down, damn!", 'offline'); 
             case 'online':
                 return setConnectionStatus("We're online again, waiting for server connection", "connecting");
             case 'connecting':
                 return setConnectionStatus("Attempting to connect, get ready... we're almost there!", "connecting");
             case 'connected':
                 return setConnectionStatus('...and we\'re connected!', 'connected');
             case 'reconnecting':
                 return setConnectionStatus("Your connection has been lost, we're attempting to reconnect you", "connecting");
             case 'reconnect_failed':
                 return setConnectionStatus("Reconnection has failed, we suggest you refresh the page...", "offline");
        }
    }

    socket.on('board.connected', function() {
    	status = 'online'
    	if (connectionCheck) clearInterval(connectionCheck)
    	connectionStatus('connected')
    })
    $(window).bind('offline', function() {
        connectionStatus('offline');
    });
    $(window).bind('online', function() {
        connectionStatus('online');
    });
    socket.on('connection', function() {
        connectionStatus('connected');
    });
    socket.on('connecting', function() {
        connectionStatus('connecting');
    });
    socket.on('reconnecting', function() {
        connectionStatus('reconnecting');
    });
    socket.on('reconnect_failed', function() {
        connectionStatus('reconnect_failed');
    });
});
