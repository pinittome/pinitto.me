var io       = require('../io').io,
    sanitize = require('validator').sanitize;

User.prototype.setName = function(data) {
	var self = this
	this.socket.get('board', function(err, board) {
		if (err) throw Error('Could not get board ID for user', err);
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
