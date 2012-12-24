io = require('../io').io;

function Card(socket, db) {
	
	this.socket = socket;
	this.db     = db;
	self        = this;
	
	this.create = function(data) {
    	self.getBoard(function(board) {
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
    
    this.moved = function(data) {
    	self.getBoard(function(board) {    	
        	socket.broadcast.to(board).emit('card.moving', data);

    		self.db.updatePosition(data, board, function(result) {
                io.sockets.in(board).emit('card.moved', data);
		    });
    	});
    };
    
    this.moving = function(data) {
    	self.getBoard(function(board) {        	
        	socket.broadcast.to(board).emit('card.moving', data);
        });
    }
    
    this.resize = function(data) {
    	self.getBoard(function(board) {     	
        	socket.broadcast.to(board).emit('card.resize', data);
        	self.db.updateSize(data, board);
    	});
    };
    
    this.remove = function(data) {
    	self.getBoard(function(board) {       	
            self.db.remove(data, board, function() {
            	io.sockets.in(board).emit('card.delete', data);	
	    		statistics.cardRemoved();
            });
    	});
    }
    
    this.changeColour = function(data) {
    	self.getBoard(function(board) {   	
			socket.broadcast.to(board).emit('card.colour', data); 
    		self.db.updateColour(data, board);        
    	});
    }
    
    this.stackOrder = function(data) {
    	self.getBoard(function(board) {
    		socket.broadcast.to(board).emit('card.zIndex', data);
    		self.db.updateOrder(data, board, function() {
    			io.sockets.in(board).emit('card.zIndex', data);
    		});
    	});
    }
    
    this.textChange = function(data) {
    	self.getBoard(function(board) {       	
        	socket.broadcast.to(board).emit('card.text-change', data);
        	self.db.updateContent(data, board);
    	});
    }
    this.getBoard = function(callback) {
        self.socket.get('board', function(error, board) {
            if (error) throw Error('Could not get board ID for user', error);
            callback(board);
        });
    }

    
	return this;
}

module.exports = Card;
