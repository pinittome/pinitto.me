var io         = require('../io').io,
    statistics = require('../statistics'),
    sanitizer  = require('./sanitize/card'),
    util       = require('util'),
    events     = require('events');

Card.prototype.create = function(data) {
	var self = this
	this.getBoard(function(board) {
		data.board = board;
		data.size  = { width: 150, height: 150 };
		console.log("TODO: Get default card details from config");
	    console.log("TODO: Check card create data is valid");

		self.db.add(data, function(result) {
			data.cardId = result[0]._id;
			self.io.sockets.in(board).emit('card.created', data);
			statistics.cardAdded();
		});	
	});
};

Card.prototype.moved = function(data) {
	var self = this
	var data = this.sanitizer.move(data) 
	this.getBoard(function(board) { 
		  	
    	self.socket.broadcast.to(board).emit('card.moving', data)

		self.db.updatePosition(data, board, function(result) {
            self.io.sockets.in(board).emit('card.moved', data);
	    });
	});
};

Card.prototype.moving = function(data) {
	var self = this
	var data = this.sanitizer.move(data) 
	this.getBoard(function(board) {        	
    	self.socket.broadcast.to(board).emit('card.moving', data);
    });
}

Card.prototype.resize = function(data) {
	var self = this
	var data = this.sanitizer.resize(data)
	this.getBoard(function(board) {     	
    	self.socket.broadcast.to(board).emit('card.resize', data);
    	self.db.updateSize(data, board);
	});
};

Card.prototype.remove = function(data) {
	var self = this
	this.sanitizer.checkCardId(data.cardId)
	this.getBoard(function(board) {    	
        self.db.remove(data, board, function() {
        	data.name = self.socket.get('name', function(error, name) {
				if (error) {
					name = 'A user';
				}
				data.name = name;
	        	self.io.sockets.in(board).emit('card.delete', data);	
	    		self.statistics.cardRemoved();
	    	});
        });
	});
}

Card.prototype.changeColour = function(data) {
	var self = this
	this.getBoard(function(board) {   	
		self.socket.broadcast.to(board).emit('card.colour', data); 
		self.db.updateColour(data, board);        
	});
}

Card.prototype.stackOrder = function(data) {
	var self = this
	this.getBoard(function(board) {
		self.socket.broadcast.to(board).emit('card.zIndex', data);
		self.db.updateOrder(data, board, function() {
			self.io.sockets.in(board).emit('card.zIndex', data);
		});
	});
}

Card.prototype.textChange = function(data) {
	var self = this
	this.getBoard(function(board) {       	
    	self.socket.broadcast.to(board).emit('card.text-change', data);
    	self.db.updateContent(data, board);
	});
}
Card.prototype.getBoard = function(callback) {
    this.socket.get('board', function(error, board) {
        if (error) throw Error('Could not get board ID for user', error);
        callback(board);
    });
}
Card.prototype.setDatabase = function(db) {
	this.db     = db;
}
Card.prototype.setSocketContext = function(socket) {
	this.socket = socket;
}
Card.prototype.setStatistics = function(statistics) {
	this.statistics = statistics
}
Card.prototype.setIo = function(io) {
	this.io = io
}
Card.prototype.setSanitizer = function(sanitizer) {
	this.sanitizer = sanitizer
}
function Card() {
	events.EventEmitter.call(this)
}

card = new Card();
card.setStatistics(statistics)
card.setIo(io)
card.setSanitizer(sanitizer)
module.exports = card;
