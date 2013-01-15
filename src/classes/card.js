var santizier  = require('./sanitize/card'),
    statistics = require('../statistics'),
    db         = require('../database/cards')

module.exports = Card = function Card(){};

Card.prototype.create = function(data) {
	var self = this
	this.getBoard(function(board) {
		data.board = board;
		data.size  = { width: 150, height: 150 };
		console.log("TODO: Get default card details from config");
	    console.log("TODO: Check card create data is valid");

		db.add(data, function(error, result) {
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
		var data = santizier.move(data)
	} catch (e) {
		console.log(e, data)
		return this.socket.emit('error', {message: 'Illegal card position sent'})
	} 
	this.getBoard(function(board) { 
		  	
    	self.socket.broadcast.to(board).emit('card.moving', data)

		db.updatePosition(data, board, function(error) {
			if (error) return self.socket.emit('error', {message: error})
            self.io.sockets.in(board).emit('card.moved', data);
	    });
	});
};

Card.prototype.moving = function(data) {
	var self = this
	try { 
		var data = santizier.move(data)
	} catch (e) {
		console.log(e, data)
		return this.socket.emit('error', {message: 'Illegal card position sent'})
	}
	this.getBoard(function(board) {        	
    	self.socket.broadcast.to(board).emit('card.moving', data);
    });
}

Card.prototype.resize = function(data) {
	var self = this
	try { 
		var data = santizier.resize(data)
	} catch (e) { 
		return this.socket.emit('error', {message: 'Card size too small'})
	}
	this.getBoard(function(board) {     	
    	self.socket.broadcast.to(board).emit('card.resize', data);
    	db.updateSize(data, board, function(error) {
    		if (error) self.socket.emit('error', {message:error})
    	});
	});
};

Card.prototype.remove = function(data) {
	var self = this
	try { 
		santizier.checkCardId(data.cardId)
	} catch (e) { 
		return this.socket.emit('error', {message: 'Illegal card ID'})
	}
	this.getBoard(function(board) {    	
        db.remove(data, board, function() {
        	data.name = self.socket.get('name', function(error, name) {
				if (error) {
					name = 'A user';
				}
				data.name = name;
	        	self.io.sockets.in(board).emit('card.delete', data);	
	    		self.statistics.cardRemoved(function(error) {
	    			if (error) self.socket.emit('error', {message:error})
	    		});
	    	});
        });
	});
}

Card.prototype.changeColour = function(data) {
	var self = this
	try { 
		var data = santizier.changeColour(data)
	} catch (e) { 
		console.log(e)
		return this.socket.emit('error', {message: 'Illegal card colour data provided'})
	}
	this.getBoard(function(board) {   	
		self.socket.broadcast.to(board).emit('card.colour', data); 
		db.updateColour(data, board, function(error) {
			if (error) self.socket.emit('error', {message:error})
		});        
	});
}

Card.prototype.stackOrder = function(data) {
	var self = this
	this.getBoard(function(board) {
		self.socket.broadcast.to(board).emit('card.zIndex', data);
		db.updateOrder(data, board, function(error) {
			if (error) return self.socket.emit('error', {message:error})
			self.io.sockets.in(board).emit('card.zIndex', data);
		});
	});
}

Card.prototype.textChange = function(data) {
	var self = this
	try { 
		var data = santizier.content(data)
	} catch (e) { 
		return this.socket.emit('error', {message: 'Illegal card content sent'})
	}
	this.getBoard(function(board) {       	
    	self.socket.broadcast.to(board).emit('card.text-change', data);
    	db.updateContent(data, board, function(error) {
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
Card.prototype.setSocketContext = function(socket) {
	this.socket = socket;
}
Card.prototype.setIo = function(io) {
	this.io = io;
}
