var santizier   = require('./sanitize/card'),
    statistics  = require('../statistics'),
    db          = require('../database/cards');

var Card = function Card(board) {
	this.board = board
        this.socket = null
}

Card.prototype.create = function(data) {
    var self = this;
    try { 
        var data = santizier.create(data)
    } catch (e) {
        console.log(e, data)
        return this.socket.emit('error', {message: 'New card could not be created'})
    } 
    this.getBoardConfig(function(error, config) {
    	if (error) return self.socket.emit('error', {message: 'New card could not be created'});
        data.board = '/' + config._id;
        data.size  = { width: 150, height: 150 };
        if (config.grid.position) {
        	data.position = self.calculateCardPosition(data.position, config.grid.position);
        }
        db.add(data, function(error, result) {
            if (error) return self.socket.emit('error', {message: 'New card could not be created'})
            data.cardId = result.ops[0]._id;
            self.io.sockets.in('/' + config._id).emit('card.created', data);
            statistics.cardAdded();
        });    
    });
};

Card.prototype.calculateCardPosition = function(position, size) {
	var grid = null;
	switch (size) {
		case 'large':
		    grid = 100;
		    break;
		case 'medium':
		    grid = 50;
		    break;
		case 'small':
		    grid = 25;
		    break;
	}
	if (null == grid) return position;
	return {x: Math.floor(position.x / grid) * grid, y: Math.floor(position.y / grid) * grid};
}

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
        return this.socket.emit('error', {message: 'Illegal card position sent'})
    }
    this.getBoard(function(board) {            
        self.socket.volatile.broadcast.to(board).emit('card.moving', data);
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
                data.name   = name;
                data.userId = self.socket.id
                self.io.sockets.in(board).emit('card.delete', data);    
                statistics.cardRemoved(function(error) {
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
        if (error) return self.socket.emit(
        	'error',
        	{message:'Could not get board ID for user', action: 'reload'}
        );
        callback(board);
    });
}

Card.prototype.getBoardConfig = function(callback) {
	var self = this;
	this.socket.get('board', function(error, id) {
		if (error) return callback(error, null);
		if (null == id) {
			self.socket.emit('board.request-join');
			return callback('Board not loaded, please try again');
		}
		self.board.load(id, callback);
	});
}
Card.prototype.setSocketContext = function(socket) {
    this.socket = socket;
}
Card.prototype.setIo = function(io) {
    this.io = io;
}

module.exports = Card
