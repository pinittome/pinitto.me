var io      = require('../io').io,
    access  = require('../access'),
    utils   = require('../util'),
    async   = require('async')

var Board = function Board() {
    this.socket = null;
}

Board.prototype.setName = function(data) {
    var self = this;
    try {
        var data = this.sanitizer.rename(data)
    } catch (e) {
        return this.socket.emit('error', {message: 'Illegal board ID provided'});
    }
    this.socket.get('board', function(error, board) {
        if (error) return self.socket.emit('error', {message: "Board name not saved to database"})
        self.socket.set('name', data.name, function() {
            io.sockets.in(board).emit('board.name.set', {name: data.name, userId: self.socket.id});
        });
        self.db.setName(board, data.name, function(error) {
            if (error) self.socket.emit('error', {message: "Board name not saved to database"})
        });
    });
}

Board.prototype.setAccess = function(data) {
    var self = this
    this.socket.get('board', function(error, boardId) {

        if (error) return self.socket.emit('error', {message: "Access details not changed"})

        self.db.load(boardId, function(error, board) {
            if (error) return self.socket.emit('error', {message: 'Not able to load board'})

            var saveAccess = function() {
                self.db.setAccess(boardId, board.access, function(error) {
                    if (error)
                       return self.socket.emit('error', {message: 'Access details could not be updated'})
                    io.sockets.in(boardId).emit('board.access.set', {userId: self.socket.id})
                })
            }            

            var validData = true
            access.levels.forEach(function(level) {
                switch (true) {
                    case (typeof(data[level]) == 'undefined'):
                    case (typeof(data[level].require) == 'undefined'):
                    case (typeof(data[level].password) == 'undefined'):
                        validData = false
                }
            })
            // This should never be the case with valid UI call
            if (false == validData) return self.socket.emit('error', {message: 'Invalid access data provided'})

            async.parallel([
                function(callback) {
                    if (false == data.admin.require) {
                        delete board.access.admin
                        return callback(null, true)
                    }
                    if (true == data.admin.require && '' == data.admin.password)
                        return callback({message: 'Admin password required but not provided'}, null)
                    utils.hashPassword(data.admin.password, function(hash) {
                        board.access.admin = hash
                        callback(null, true)
                    })
                },
                function(callback) {
                    if (false == data.write.require) {
                        delete board.access.write
                        return callback(null, true)
                    }
                    if (true == data.write.require && '' == data.write.password)
                        return callback({message: 'Password for write access required but not provided'}, null)
                    utils.hashPassword(data.write.password, function(hash) {
                        board.access.write = hash
                        callback(null, true)
                    })
                },
                function(callback) {
                    if (false == data.read.require) {
                        delete board.access.read
                        return callback(null, true)
                    }
                    if (true == data.read.require && '' == data.read.password)
                        return callback({message: 'Password for read access required but not provided'}, null)
                    utils.hashPassword(data.read.password, function(hash) {
                        board.access.read = hash
                        callback(null, true)
                    })
                }
            ], function(error, results) {
                if (error) return self.socket.emit('error', error)
                console.log(board.access)
                saveAccess()
            })
        })
    })
}

Board.prototype.load = function(id, callback) {
	var self = this;
	self.db.load(id, function(error, board) {
		if (error) return callback(error, null);
		callback(null, board);
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
        if (error) return console.log('Error on user disconnect', error); 
        self.socket.broadcast.to(board).emit('user.leave', {userId: self.socket.id});
        self.socket.set('access', null);
        self.socket.leave(board);
        statistics.socketClosed();
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
            console.log([
            	'**************************************************',
            	'User is not allowed to view this board',
            	'**************************************************'
            	].join("\n"), session);
            self.socket.emit('connect.fail', 'You are not authorised to view this board');
            self.socket.disconnect();
            return;
        }
        self.socket.set('access', session.access, function() {
            self.socket.set('board', '/' + self.board, function() {
            	console.log("User is joining board " + self.boardName)
                self.socket.join(self.boardName)
                userNameIndex = 1
                self.sendUserList(details)
                self.socket.emit('board.connected')
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
    var clients = io.sockets.clients(this.boardName);
    var self    = this;
    
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

Board.prototype.setSizeGrid = function(size) {
	var size = this._getSize(size);
	var self = this;
	this.socket.get('board', function(error, board) {
		if (error) return self.socket.emit('error', {message: 'Could not save grid size changes'});
	    io.sockets.in(board).emit('board.grid.size', size);
	    self.db.setSizeGrid(board, size, function(error) {
	        if (error) return self.socket.emit('error', {message: 'Could not save grid size changes'});
	    });
	});
}

Board.prototype.setPositionGrid = function(size) {
	var size = this._getSize(size);
	var self = this;
	this.socket.get('board', function(error, board) {
		if (error) return self.socket.emit('error', {message: 'Could not save position grid changes'});
	    io.sockets.in(board).emit('board.grid.position', size);
	    self.db.setPositionGrid(board, size, function(error) {
	        if (error) return self.socket.emit('error', {message: 'Could not save position grid changes'});
	    });
	});
}

Board.prototype._getSize = function(size) {
	var grid = 'none';
	switch (size) {
		case 'large':
		case 'medium':
		case 'small':
		    grid = size;
	}
	return grid;
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

module.exports = Board
