var io       = require('../io').io,
    sanitize = require('validator').sanitize;

User.prototype.setName = function(data) {
    var self = this
    this.socket.get('board', function(error, board) {
        if (error) self.socket.emit("error", {message: "Could not find your board ID#", action: 'reload'});
        var name = sanitize(data.name).xss();
        self.socket.set('name', name, function() {
            io.sockets.in(board).emit('user.name.set', {name: name, userId: self.socket.id});
        });
    });
};

User.prototype.setSocketContext = function(socket) {
    this.socket = socket;
}

function User() {}
user = new User();

module.exports = user;
