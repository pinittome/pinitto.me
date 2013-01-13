var io         = require('../io').io,
    statistics = require('../statistics'),
    sanitizer  = require('./sanitize/card');
    
Card.prototype.create = function(data) {
	var self = this
	this.getBoard(function(board) {
		data.board = board;
		data.size  = { width: 150, height: 150 };
		console.log("TODO: Get default card details from config");
	    console.log("TODO: Check card create data is valid");

		self.db.add(data, function(error, result) {
			if (error) return self.socket.emit('error', {message: 'New card could not be created'})
			data.cardId = result[0]._id;
			self.io.sockets.in(board).emit('card.created', data);
			statistics.cardAdded();
		});	
	});
};

Card.prototype.moved = function(data) {
	var self = this
	try { 
		var data = this.sanitizer.move(data)
	} catch (e) { 
		return this.socket.emit('error', {message: 'Illegal card position sent'})
	} 
	this.getBoard(function(board) { 
		  	
    	self.socket.broadcast.to(board).emit('card.moving', data)

		self.db.updatePosition(data, board, function(error) {
			if (error) return self.socket.emit('error', {message: error})
            self.io.sockets.in(board).emit('card.moved', data);
	    });
	});
};

Card.prototype.moving = function(data) {
	var self = this
	try { 
		var data = this.sanitizer.move(data)
	} catch (e) { 
		return this.socket.emit('error', {message: 'Illegal card position sent'})
	}
	this.getBoard(function(board) {        	
    	self.socket.broadcast.to(board).emit('card.moving', data);
    });
}

Card.prototype.resize = function(data) {
	var self = this
	try { 
		var data = this.sanitizer.resize(data)
	} catch (e) { 
		return this.socket.emit('error', {message: 'Card size too small'})
	}
	this.getBoard(function(board) {     	
    	self.socket.broadcast.to(board).emit('card.resize', data);
    	self.db.updateSize(data, board, function(error) {
    		if (error) self.socket.emit('error', {message:error})
    	});
	});
};

Card.prototype.remove = function(data) {
	var self = this
	try { 
		this.sanitizer.checkCardId(data.cardId)
	} catch (e) { 
		return this.socket.emit('error', {message: 'Illegal card ID'})
	}
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
	try { 
		var data = this.sanitizer.changeColour(data)
	} catch (e) { 
		return this.socket.emit('error', {message: 'Illegal card colour data provided'})
	}
	this.getBoard(function(board) {   	
		self.socket.broadcast.to(board).emit('card.colour', data); 
		self.db.updateColour(data, board, function(error) {
			self.socket.emit('error', {message:error})
		});        
	});
}

Card.prototype.stackOrder = function(data) {
	var self = this
	this.getBoard(function(board) {
		self.socket.broadcast.to(board).emit('card.zIndex', data);
		self.db.updateOrder(data, board, function(error) {
			if (error) return self.socket.emit('error', {message:error})
			self.io.sockets.in(board).emit('card.zIndex', data);
		});
	});
}

Card.prototype.textChange = function(data) {
	var self = this
	try { 
		var data = this.sanitizer.content(data)
	} catch (e) { 
		return this.socket.emit('error', {message: 'Illegal card content sent'})
	}
	this.getBoard(function(board) {       	
    	self.socket.broadcast.to(board).emit('card.text-change', data);
    	self.db.updateContent(data, board, function(error) {
    		if (error) self.socket.emit('error', {message:error})
    	});
	});
}
Card.prototype.getBoard = function(callback) {
	var self = this;
    this.socket.get('board', function(error, board) {
        if (error) return self.socket.emit('error', {message:'Could not get board ID for user', action: 'reload'});
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
