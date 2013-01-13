var io        = require('../io').io,
    access    = require('../access'),
    utils     = require('../util'),
    sanitizer = require('./sanitize/board'),
    util      = require('util'),
    events    = require('events');

Board.prototype.setName = function(data) {
	var self = this
	var data = this.sanitizer.rename(data)
	this.socket.get('board', function(error, board) {
		if (error) return events.EventEmitter.emit('socket-error', 'Could not get board ID for user', err);    		
		self.socket.set('name', data.name, function() {
			io.sockets.in(board).emit('board.name.set', {name: data.name, userId: self.socket.id});
		});
		self.db.setName(board, data.name, function(error) {
			if (error) self.socket.emit('error', {message: "Board name not saved to database"})
		});
	});
}
  
Board.prototype.leave = function() {
	var self = this
	this.sanitizer.checkBoardId(board)
	this.socket.get('board', function(error, board) {
		if (error) return events.EventEmitter.emit('storage-error', 'Error on user disconnect') 
    	self.socket.leave(board);
    	self.socket.broadcast.to(board).emit('user.leave', {userId: self.socket.id});
	});
}

Board.prototype.join = function(details) {
    this.board     = details.id
	this.boardName = '/' + this.board
    var self      = this
    
	this.session.get(this.socket.handshake.sessionID, function(error, session) {
    
		if (error 
			|| (session.board != self.board) 
		    || !utils.inArray(session.access, [access.ADMIN, access.WRITE, access.READ])
		) {		
			self.socket.emit('connect.fail', 'You are not authorised to view this board');
			self.socket.disconnect();
			return;
		}

		self.socket.set('access', session.access, function() {
			self.socket.set('board', '/' + self.board, function() {
				self.socket.join(self.boardName);
			
				userNameIndex = 1;
				self.sendUserList(details);			
				self.cardsDb.fetch(self.boardName, function(error, docs) {
					if (error) return self.socket.emit('error', {message: error})
					self.socket.emit('card.list', docs);
				});
			});
		});
	});
}

Board.prototype.sendUserList = function(details) {
	var name;
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

function Board() {
	events.EventEmitter.call(this)
}

board = new Board();
board.setSanitizer(sanitizer)

module.exports = board;