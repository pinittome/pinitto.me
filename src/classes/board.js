io     = require('../io').io;
access = require('../access');
utils  = require('../util');

function Board(socket, db, session, cardsDb) {
	
	this.socket  = socket;
	this.db      = db;
	this.session = session;
	this.cardsDb = cardsDb;
	self         = this;
	
	this.setName = function(data) {
    	self.socket.get('board', function(error, board) {
    		if (error) throw Error('Could not get board ID for user', err);    		
    		self.socket.set('name', data.name, function() {
    			io.sockets.in(board).emit('board.name.set', {name: data.name, userId: socket.id});
    		});
    		self.db.setName(board, data.name);
    	});
    }
      
    this.leave = function() {
    	self.socket.get('board', function(error, board) {
    		if (error) throw Error('Error on user disconnect', err); 
	    	self.socket.leave(board);
	    	self.socket.broadcast.to(board).emit('user.leave', {userId: socket.id});
    	});
    }
    
    this.join = function(details) {
        board     = details.id;
		boardName = '/' + board;
		self.session.get(socket.handshake.sessionID, function(error, session) {
			if (error 
				|| (session.board != board) 
			    || !utils.inArray(session.access, [access.ADMIN, access.WRITE, access.READ])
			) {
				socket.emit('connect.fail', 'You are not authorised to view this board');
				socket.disconnect();
				return;
			}

			self.socket.set('access', session.access, function() {
				self.socket.set('board', '/' + board, function() {
					self.socket.join(boardName);
				
					userNameIndex = 1;
					self.sendUserList(details);			
					self.cardsDb.fetch(boardName, function(docs) {
						self.socket.emit('card.list', docs);
					});
				});
			});
		});
    }
    
    this.sendUserList = function(details) {
    	clients = io.sockets.clients(boardName);
		if (details.user) {
			name = details.user;
		} else {
			clients.forEach(function(socketId) {
				if (socketId.store.data.index && (socketId.store.data.index >= userNameIndex)) {
					userNameIndex = parseInt(socketId.store.data.index) + 1;
				}
			});
		    name = 'User ' + userNameIndex;
		}
		self.socket.set('name', name, function() {
			self.socket.set('index', userNameIndex, function() {
				clients.forEach(function(socketId) {
					data           = socketId.store.data;
					data['userId'] = socketId.store.id;
					if (!data.name) {
						data.name  = 'User 1';
						data.index = 1;
					}
					self.socket.emit('user.list', data);
				});
			    self.socket.broadcast
			        .to(boardName)
			        .emit('user.join', {userId: self.socket.id, name: name});
			});
	    });
	}
	
	return this;
}

module.exports = Board;