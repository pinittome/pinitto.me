define(['socket.io'], function() {
    var socket = io.connect('//' + window.document.location.host);
    return socket;
})
