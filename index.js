var 

Session = require('connect').middleware.session.Session
  , utils = require('./src/util')
  , access = require('./src/access')
  , totals = utils.totals
  , sanitize = require('validator').sanitize;
  
environment = process.env.NODE_ENV || 'production';


config = require('./config.' + environment + '.js');
config.cookie.key = 'connect.sid';

db = require('./src/database');

httpServer = require('./src/server');
io         = require('socket.io').listen(httpServer.server)



  
io.configure(function (){
    io.set('authorization', function(data, accept) {
	    if (!data.headers.cookie) {
	    	accept(null, true);
	    }
        data.cookies      = require('cookie').parse(data.headers.cookie);
        data.cookies      = require('cookie').parse(data.headers.cookie, config.cookie.secret);
        data.sessionID    = data.cookies['connect.sid'].split('.')[0].split(':')[1];
        data.sessionStore = require('./src/session').store;

        require('./src/session').store.get(data.sessionID, function(err, session) {
	        if (err || !session) {
	            console.log("ERROR", err);
	            console.log("session:", session);
	        }
	        data.session = new Session(data, session);
	        console.log("session data" , data.session);
	        data.session.save();
	        accept(null, true);
        });
	});
});

io.sockets.on('connection', function (socket) {

    socket.on('board.join', function(details) {

        board     = details.id;
		boardName = '/' + board;
		require('./src/session').store.get(socket.handshake.sessionID, function(err, session) {

			if (err) return socket.emit(
				'connect_fail',
				'You do not have autorization to view this board'
			);
			console.log('Auth:', session.board, session.access, board);
			if ((session.board == board) 
			    && utils.inArray(session.access, [access.ADMIN, access.WRITE, access.READ])
			) {
				socket.set('access', session.access, function() {
					socket.set('board', '/' + board, function() {
					socket.join(boardName);
				
					userNameIndex = 1;
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
					socket.set('name', name, function() {
						socket.set('index', userNameIndex, function() {
							clients.forEach(function(socketId) {
								data           = socketId.store.data;
								data['userId'] = socketId.store.id;
								if (!data.name) {
									data.name  = 'User 1';
									data.index = 1;
								}
								socket.emit('user.list', data);
							});
						    socket.broadcast
						        .to(boardName)
						        .emit('user.join', {userId: socket.id, name: name});
						});
					});
					// Send user all the relevant cards
					
						console.log('Retrieving all cards for boardname ' + boardName);
						db.cards.find({board: boardName}).batchSize(10).toArray(function(err, docs) {
							if (err) throw Error('Can not load cards');
							socket.emit('card.list', docs);
						});
					
				});
			});
			} else {
				socket.emit('connect_failed', 'You are not authorised to view this board')
			}
		});
    });
    
    socket.on('board.leave', function() {
    	socket.get('board', function(err, board) {
    		if (err) throw Error('Error on user disconnect', err); 
	    	console.log('User is leaving board ' + board);
	    	socket.leave(board);
	    	socket.broadcast.to(board).emit('user.leave', {userId: socket.id});
    	});
    })
    socket.on('disconnect', function() {
    	socket.get('board', function(err, board) {
    		if (err) throw Error('Error on user disconnect', err); 
	        console.log('User has left the board');
	        socket.broadcast.to(board).emit('user.leave', {userId: socket.id});
	    });
    });
    socket.on('card.create', function(data) {
    	socket.get('board', function(err, board) {
    		data.board = board;
    		data.size  = { width: 150, height: 150 };
    		console.log("TODO: Get default card details from config");
    		console.log("TODO: Check card create data is valid");

	    		db.cards.insert(data, function(err, result) {
	    			if (err) throw Error('Could not create new card', err);
	    			data.cardId = result[0]._id;
	    			io.sockets.in(board).emit('card.created', data);
	    			cardAdded();
	    		});	
    		
    	});
    });
    socket.on('card.moved', function(data) {
    	socket.get('board', function(err, board) {
        	if (err) throw Error('Could not get board ID for user', err);         	
        	socket.broadcast.to(board).emit('card.moving', data);

	    		db.cards.update(
	    			{_id: new db.ObjectId(data.cardId), board: board},
	    			{$set:{position:data.position}},
	    			{w:1},
	    			function(err, numberOfResults) {
		    			if (err || (numberOfResults != 1)) throw Error('Could not save new card position', err);
		    			io.sockets.in(board).emit('card.moved', data);
		    		}
    		    );
        	
    	});
    });
    socket.on('card.resize', function(data) {
    	socket.get('board', function(err, board) {
        	if (err) throw Error('Could not get board ID for user', err);         	
        	socket.broadcast.to(board).emit('card.resize', data);
        	
    			 
	    		db.cards.update(
	    			{_id: new db.ObjectId(data.cardId), board: board},
	    			{$set:{size:data.size}},
	    			{w:1},
	    			function(err, numberOfResults) {
		    			if (err || (numberOfResults != 1)) throw Error('Could not save new card size', err);
		    		}
    		    );
        	
    	});
    });
    socket.on('card.delete', function(data) {
    	socket.get('board', function(err, board) {
        	if (err) throw Error('Could not get board ID for user', err);         	

	    		db. cards.remove(
	    			{_id: new db.ObjectId(data.cardId), board: board},
	    			{w:1},
	    			function(err, numberOfResults) {
		    			if (err) throw Error('Could not save new card size', err);
		    			data.name = socket.get('name', function(err, name) {
		    				if (err) {
		    					name = 'A user';
		    				}
		    				data.name = name;
		    			    if (numberOfResults == 1) {
		    			    	io.sockets.in(board).emit('card.delete', data);	
		    			    	cardRemoved();
		    			    }
		    			});
		    		}
    		    );
    	});
    });
    socket.on('card.colour', function(data) {
    	socket.get('board', function(err, board) {
        	if (err) throw Error('Could not get board ID for user', err);         	
    
    			socket.broadcast.to(board).emit('card.colour', data); 
	    		db.cards.update(
	    			{_id: new db.ObjectId(data.cardId), board: board},
	    			{$set:{cssClass:data.cssClass}},
	    			{w:1},
	    			function(err, numberOfResults) {
		    			if (err) throw Error('Could not update card colour', err);
		    		}
    		    );
        
    	});
    });
    socket.on('card.zIndex', function(data) {
    	socket.get('board', function(err, board) {
        	if (err) throw Error('Could not get board ID for user', err);         	
        	socket.broadcast.to(board).emit('card.zIndex', data);
        	
	    		db.cards.update(
	    			{_id: new db.ObjectId(data.cardId), board: board},
	    			{$set:{zIndex:data.zIndex}},
	    			{w:1},
	    			function(err, numberOfResults) {
		    			if (err) throw Error('Could not save new card zIndex', err);
		    			io.sockets.in(board).emit('card.zIndex', data);
		    		}
    		    );
        
    	});
    });
    socket.on('card.moving', function(data) {
        socket.get('board', function(err, board) {
        	if (err) throw Error('Could not get board ID for user', err);         	
        	socket.broadcast.to(board).emit('card.moving', data);
        });
    });
    socket.on('card.text-change', function(data) {
    	socket.get('board', function(err, board) {
        	if (err) throw Error('Could not get board ID for user', err);         	
        	socket.broadcast.to(board).emit('card.text-change', data);
        	
	    		db.cards.update(
	    			{_id: new db.ObjectId(data.cardId), board: board},
	    			{$set:{content:sanitize(data.content).xss()}},
	    			{w:1},
	    			function(err, numberOfResults) {
		    			if (err) throw Error('Could not save new card content', err);
		    		}
    		    );
        	
    	});
    });
    socket.on('user.name.set', function(data) {
    	socket.get('board', function(err, board) {
    		if (err) throw Error('Could not get board ID for user', err);
    		name = sanitize(data.name).xss();
    		socket.set('name', name, function() {
    			io.sockets.in(board).emit('user.name.set', {name: name, userId: socket.id});
    		});
    	});
    });
    socket.on('board.name.set', function(data) {
    	socket.get('board', function(err, board) {
    		if (err) throw Error('Could not get board ID for user', err);
    		name = sanitize(data.name).xss();
    		socket.set('name', name, function() {
    			io.sockets.in(board).emit('board.name.set', {name: name, userId: socket.id});
    		});

	        
	    		db.boards.update(
	    			{_id: new db.ObjectId(board.replace('/', ''))},
	    			{$set:{name:name}},
	    			{w:1},
	    			function(err, numberOfResults) {
		    			if (err) throw Error('Could not save new board details', err);
		    		}
    		    );
        	
    	});
    });

	/** User statistics */
	newBoardCreated = function() {
		++totals.boards;
		sendTotals();
	}
	boardRemoved = function() {
		--totals.boards;
		sendTotals();
	}
	cardAdded = function() {
		++totals.cards;
		sendTotals();
	}
	cardRemoved = function() {
		--totals.cards;
		sendTotals();
	}
	sendTotals = function() {
		io.sockets.in('/').emit('totals', totals);
	}
	getTotalCardCount = function() {
		try {
	        
	        	db.cards.count(function(err, count) {
	        		if (err) throw err;
	        		totals.cards = count;
	        		sendTotals();
	        	});
	        
		} catch (e) {
		  	console.log(e);
		}	
	}
	getTotalBoardCount = function() {
		try {
	        
	        	db.boards.count(function(err, count) {
	        		if (err) throw err;
	        		totals.boards = count;
	        		sendTotals();
	        	});
	        
		} catch (e) {
		  	console.log(e);
		}	
	}
		
	setInterval(getTotalCardCount, 60000);
	setTimeout(function() {
		setInterval(getTotalBoardCount, 120000);
		getTotalBoardCount();
	}, 30000);	
	getTotalCardCount();
	
});

