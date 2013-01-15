var io        = require('../io').io,
    access    = require('../access'),
    utils     = require('../util');

module.exports = Board = function Board(){};

Board.prototype.setName = function(data, callback) {
	var self = this
	try {
	    var data = this.sanitizer.rename(data)
	} catch (e) {
		return this.socket.emit('error', {message: 'Illegal board ID provided'});
	}
	this.socket.get('board', function(error, board) {
		if (error) return callback('Could not get board ID for user')
		self.socket.set('name', data.name, function() {
			io.sockets.in(board).emit('board.name.set', {name: data.name, userId: self.socket.id});
		});
		self.db.setName(board, data.name, function(error) {
			if (error) self.socket.emit('error', {message: "Board name not saved to database"})
		});
		callback()
	});
}
  
Board.prototype.leave = function() {
	var self = this
	try {
	    this.sanitizer.checkBoardId(board)
	} catch (e) {
		return this.socket.emit('error', {message: 'Illegal board ID provided'});
	}	
	this.socket.get('board', function(error, board) {
		if (error) return callback('Error on user disconnect'); 
    	self.socket.leave(board);
    	self.socket.broadcast.to(board).emit('user.leave', {userId: self.socket.id});
    	callback()
	});
}

Board.prototype.join = function(details) {

    this.board     = details.id
	this.boardName = '/' + this.board
    var self       = this
    
	this.session.get(this.socket.handshake.sessionID, function(error, session) {
		if (error 
			|| (session.board != self.board) 
		    || !utils.inArray(session.access, [access.ADMIN, access.WRITE, access.READ])
		) {
			console.log("User is not allowed to view this board", session);
			self.socket.emit('connect.fail', 'You are not authorised to view this board');
			self.socket.disconnect();
			return;
		}

		self.socket.set('access', session.access, function() {
			self.socket.set('board', '/' + self.board, function() {
				self.socket.join(self.boardName);
				userNameIndex = 1;
				self.sendUserList(details);			
				self.sendCardList()
			});
		});
	});
}

Board.prototype.sendCardList = function() {
	var self = this;
	console.log("Sending card list for board " + this.boardName)
	this.cardsDb.fetch(this.boardName, function(error, docs) {
	    if (error) return this.socket.emit('error', {message: error})
		self.socket.emit('card.list', docs);
	});
}

Board.prototype.sendUserList = function(details) {
	var name;
	console.log("Sending user list for board " + this.boardName)
	var clients = io.sockets.clients(this.boardName);
	var self = this;
	
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
				var data       = socketId.store.data;
				data['userId'] = socketId.store.id;
				if (!data.name) {
					data.name  = 'User 1';
					data.index = 1;
				}
				self.socket.emit('user.list', data);
			});
		    self.socket.broadcast
		        .to(self.boardName)
		        .emit('user.join', {userId: self.socket.id, name: name});
			});
	    });
}

Board.prototype.setParams = function(db, session, cardsDb) {
	this.db      = db;
	this.session = session;
	this.cardsDb = cardsDb;
}

Board.prototype.setSocketContext = function(socket) {
	this.socket = socket
}
Board.prototype.setSanitizer = function(sanitizer) {
	this.sanitizer = sanitizer
}