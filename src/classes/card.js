var io         = require('../io').io,
    statistics = require('../statistics');

Card.prototype.create = function(data) {
	var self = this
	this.getBoard(function(board) {
		data.board = board;
		data.size  = { width: 150, height: 150 };
		console.log("TODO: Get default card details from config");
	    console.log("TODO: Check card create data is valid");

		self.db.add(data, function(result) {
			data.cardId = result[0]._id;
			io.sockets.in(board).emit('card.created', data);
			statistics.cardAdded();
		});	
	});
};

Card.prototype.moved = function(data) {
	var self = this
	this.getBoard(function(board) {    	
    	self.socket.broadcast.to(board).emit('card.moving', data);

		self.db.updatePosition(data, board, function(result) {
            io.sockets.in(board).emit('card.moved', data);
	    });
	});
};

Card.prototype.moving = function(data) {
	var self = this
	this.getBoard(function(board) {        	
    	self.socket.broadcast.to(board).emit('card.moving', data);
    });
}

Card.prototype.resize = function(data) {
	var self = this
	this.getBoard(function(board) {     	
    	self.socket.broadcast.to(board).emit('card.resize', data);
    	self.db.updateSize(data, board);
	});
};

Card.prototype.remove = function(data) {
	var self = this
	this.getBoard(function(board) {    	
        self.db.remove(data, board, function() {
        	data.name = self.socket.get('name', function(error, name) {
				if (error) {
					name = 'A user';
				}
				data.name = name;
	        	io.sockets.in(board).emit('card.delete', data);	
	    		statistics.cardRemoved();
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
			io.sockets.in(board).emit('card.zIndex', data);
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
function Card() {}

card = new Card();
module.exports = card;
