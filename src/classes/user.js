io = require('../io').io;

function User(socket, db) {
	
	this.socket = socket;
	this.db     = db;
	self        = this;
	
	this.setName = function(data) {
    	self.socket.get('board', function(err, board) {
    		if (err) throw Error('Could not get board ID for user', err);
    		name = sanitize(data.name).xss();
    		self.socket.set('name', name, function() {
    			io.sockets.in(board).emit('user.name.set', {name: name, userId: socket.id});
    		});
    	});
    };
    
	return this;
}

module.exports = User;
