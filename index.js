var express = require('express')
  , app = express()
  , engine = require('ejs-locals')
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , mongo = require('mongodb')
  , ObjectId = mongo.ObjectID
  , expressValidator = require('express-validator')
  , crypto = require('crypto')
  , captcha = require('captcha')
  , sanitize = require('validator').sanitize
  , MongoStore = require('connect-mongo')(express)  
  , connect = require('connect')
  , Session = connect.middleware.session.Session
  , config = require('./config.js');
  
  
config.cookie.key = 'connect.sid';

var totals = { cards: 0, boards: 0 };
var db     = new require('mongodb').Db(
	config.database.name, 
	new require('mongodb').Server(
		config.database.host,
		config.database.port
	),
	{auto_reconnect: true, safe: true},
	{strict: false}
);
db.open(function(err, pClient) {
    if (err) throw err;
});
var sessionStore = new MongoStore({
    db: config.database.name,
    port: config.database.port,
    host: config.database.host,
    collection: config.cookie.table,
    clear_interval: config.cookie.clearAfter,
    auto_reconnect: true
});

var access = {
    ADMIN: 'ADMIN',
    WRITE: 'WRITE',
    READ:  'READ',
    NONE:  'NONE'	
};

server.listen(config.server.port);

app.configure(function(){
	app.use(express.cookieParser(config.cookie.secret)); 
    app.use(express.session({
    	key: config.cookie.key,
	    secret: config.cookie.secret,
	    store: sessionStore
	}));
	app.use(express.static(__dirname + '/public'));
	app.use(require('connect').cookieParser(config.cookie.secret))
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.bodyParser());
	app.use(expressValidator);
	app.use(captcha({ url: '/img/captcha.jpg', color:'#0064cd', background: 'rgb(20,30,200)' }));
	app.use(express.methodOverride());
	app.use(express.favicon(__dirname + '/public/favicon.ico'));
	app.use(app.router);
	app.use(express.logger);
	app.use(express.errorHandler({
		dumpExceptions: true, showStack: true
	}));
});

app.engine('ejs', engine);

app.get('/', function (req, res) { 
   // So ugly must fix!
   options =  JSON.parse(JSON.stringify(config.project));
   options.totals = totals;
   options.pageName = 'Index';
   res.render('index', options);
});

app.get('/login/*', function(req, res) {
	options = JSON.parse(JSON.stringify(config.project));
	options.pageName = 'Authorisation for board access';
	options.totals = totals;
	if (!req.params[0]) throw err;
	options.boardId = req.params[0];
	res.render('login', options);
});

app.get('/logout', function(req, res) {
	req.session = {};
	res.redirect('/');
});

app.post('/login/*', function(req, res) {
	req.check('board').len(24);
	req.sanitize('board');
	req.sanitize('password');
	
	options = JSON.parse(JSON.stringify(config.project));
	options.pageName = 'Authorisation for board access';
	options.totals = totals;
	
	var errors = req.validationErrors();
    if (errors) {
        options.errors = JSON.stringify(errors);
        res.render('login', options);
        return;
    }
    req.session.captcha = null;
	db.collection('boards', function(err, boards) {
        if (err) throw err;
        var id = req.param('board');
        boards.findOne({_id: ObjectId(id)}, function(err, board) {
        	if (err || (typeof(board) == 'undefined')) {
        		throw Error('Board not found');
        	}
	        req.session.access = getAccessLevel(board, hashPassword(req.param('password')));
	        req.session.board  = id;
	        if (req.session.access != access.NONE) {
	        	res.redirect('/' + id);
	        	return;
	        }
	        console.log(req.session);
	        options.errors = { 'error': 'Incorrect password for this board' };
	        res.redirect('/login/' + id);
	    });
	});
});

app.get('/create', function(req, res) {
	options =  JSON.parse(JSON.stringify(config.project));
	options.pageName = 'Create a new board';
	options.totals = totals;
	res.render('create', options);
});
app.post('/create', function(req, res) {
	options          =  JSON.parse(JSON.stringify(config.project));
	options.pageName = 'Error creating board';
	options.totals   = totals;
	
	req.assert('owner', 'Valid email address required').isEmail();
	req.sanitize('board-name');
	req.sanitize('password-admin');
	req.assert('digits').is(req.session.captcha);

	var errors = req.validationErrors();
    if (errors) {
    	if (req.xhr) {
            res.send({error: errors}, 500);
            return;
       } else {
       	    options.errors = JSON.stringify(errors);
            res.render('create', options);
            return;
       }
    }
    db.collection('boards', function(err, boards) {
    	parameters = { owner: req.param('owner'), 'access': {}};
		if (req.param('board-name') != '') parameters['name'] = req.param('board-name');
		if (req.param('password-admin') != '') {    			
			parameters['access']['admin'] = hashPassword(req.param('password-admin'));
		}
    	boards.insert(parameters, function(err, newBoard) {
    		req.session.access = access.ADMIN;
		    req.session.board  = newBoard[0]._id;
    		if (err) throw err;
    		if (req.xhr) {
    		    res.send({id: newBoard[0]._id}, 200);
    		} else {
    			res.redirect('/' + newBoard[0]._id);
    		}    		
    	});
    });
});

hashPassword = function(password) {
	hash = config.passwordSalt + password + config.password.salt;
	sha1 = crypto.createHash('sha1');
	for (var i = 0; i < config.password.hashes; i++) {
	    sha1.update(hash); 
    }
    return sha1.digest('hex');
}
// Anything else must be a board link
app.get('/*', function(req, res) {
	if (!req.params[0]) throw err;
	id = req.params[0];

	board = {};
    options =  JSON.parse(JSON.stringify(config.project));
    db.collection('boards', function(err, boards) {
    	if (err) throw Error('Oh crap! Something is really wrong, we\'re on it!', err);
    	console.log("Trying to load board " + id);
    	if (id.length != 24) {
    		res.send(404);
    		return;
    	}
    	boards.findOne({_id: ObjectId(id)}, function(err, board) {
    		if (err) throw Error('Oh crap! Something is really wrong, we\'re on it!', err);
    		if (!board) return res.send(404);
    		
    		allowedAccess = false;
    		if (req.session.access 
    			&& req.session.board 
    			&& (id == req.session.board)
    			&& inArray(req.session.access, [access.ADMIN, access.READ, access.WRITE])
    		) {
    			allowedAccess = true;		
    		} else if (typeof(req.session.access) == 'undefined') {
    			allowedAccess = true;
    		}
    		if (false == allowedAccess) {
    			res.redirect('/login/' + id);
    		}
    		name = board.name ? board.name : id
			options._layoutFile = 'layouts/board';
			options.boardId = id;
			options.boardName = name;
			req.session.access = req.session.access ? req.session.access : access.ADMIN;
			req.session.board = id;
			res.render('board', options);
    	});
	});
});

io.configure(function (){
    io.set('authorization', function(data, accept) {
	    if (!data.headers.cookie) {
	    	accept(null, true);
	    }
        data.cookies      = require('cookie').parse(data.headers.cookie);
        data.cookies      = require('cookie').parse(data.headers.cookie, config.cookie.secret);
        data.sessionID    = data.cookies['connect.sid'].split('.')[0].split(':')[1];
        data.sessionStore = sessionStore;

        sessionStore.get(data.sessionID, function(err, session) {
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

    socket.on('board.join', function(board) {

		boardName = '/' + board;
		sessionStore.get(socket.handshake.sessionID, function(err, session) {

			if (err) socket.emit(
				'connect_fail',
				'You do not have autorization to view this board'
			);
			if ((session.board == board) 
			    && inArray(session.access, [access.ADMIN, access.WRITE, access.READ])
			) {
				socket.set('access', session.access, function() {
					socket.set('board', '/' + board, function() {
					socket.join(boardName);
				
					userNameIndex = 1;
					clients = io.sockets.clients(boardName);
					
					clients.forEach(function(socketId) {
						if (socketId.store.data.index && (socketId.store.data.index >= userNameIndex)) {
							userNameIndex = parseInt(socketId.store.data.index) + 1;
						}
					});
				    name = 'User ' + userNameIndex;
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
					db.collection('cards', function(err, cards) {
						if (err) throw Error('Can not load data');
						console.log('Retrieving all cards for boardname ' + boardName);
						cards.find({board: boardName}).batchSize(10).toArray(function(err, docs) {
							if (err) throw Error('Can not load cards');
							socket.emit('card.list', docs);
						});
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
    		db.collection('cards', function(err, cards) {
    			if (err) throw Error('Could not create new card', err); 
	    		cards.insert(data, function(err, result) {
	    			if (err) throw Error('Could not create new card', err);
	    			data.cardId = result[0]._id;
	    			io.sockets.in(board).emit('card.created', data);
	    			cardAdded();
	    		});	
    		});
    	});
    });
    socket.on('card.moved', function(data) {
    	socket.get('board', function(err, board) {
        	if (err) throw Error('Could not get board ID for user', err);         	
        	socket.broadcast.to(board).emit('card.moving', data);
        	db.collection('cards', function(err, cards) {
    			if (err) throw Error('Could not save new card position', err); 
	    		cards.update(
	    			{_id: new ObjectId(data.cardId), board: board},
	    			{$set:{position:data.position}},
	    			{w:1},
	    			function(err, numberOfResults) {
		    			if (err || (numberOfResults != 1)) throw Error('Could not save new card position', err);
		    			io.sockets.in(board).emit('card.moved', data);
		    		}
    		    );
        	});
    	});
    });
    socket.on('card.resize', function(data) {
    	socket.get('board', function(err, board) {
        	if (err) throw Error('Could not get board ID for user', err);         	
        	socket.broadcast.to(board).emit('card.resize', data);
        	db.collection('cards', function(err, cards) {
    			if (err) throw Error('Could not save new card size', err); 
	    		cards.update(
	    			{_id: new ObjectId(data.cardId), board: board},
	    			{$set:{size:data.size}},
	    			{w:1},
	    			function(err, numberOfResults) {
		    			if (err || (numberOfResults != 1)) throw Error('Could not save new card size', err);
		    		}
    		    );
        	});
    	});
    });
    socket.on('card.delete', function(data) {
    	socket.get('board', function(err, board) {
        	if (err) throw Error('Could not get board ID for user', err);         	
        	db.collection('cards', function(err, cards) {
    			if (err) throw Error('Could not delete card', err); 
	    		cards.remove(
	    			{_id: new ObjectId(data.cardId), board: board},
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
    });
    socket.on('card.colour', function(data) {
    	socket.get('board', function(err, board) {
        	if (err) throw Error('Could not get board ID for user', err);         	
        	db.collection('cards', function(err, cards) {
    			if (err) throw Error('Could not update card colour', err);
    			socket.broadcast.to(board).emit('card.colour', data); 
	    		cards.update(
	    			{_id: new ObjectId(data.cardId), board: board},
	    			{$set:{cssClass:data.cssClass}},
	    			{w:1},
	    			function(err, numberOfResults) {
		    			if (err) throw Error('Could not update card colour', err);
		    		}
    		    );
        	});
    	});
    });
    socket.on('card.zIndex', function(data) {
    	socket.get('board', function(err, board) {
        	if (err) throw Error('Could not get board ID for user', err);         	
        	socket.broadcast.to(board).emit('card.zIndex', data);
        	db.collection('cards', function(err, cards) {
    			if (err) throw Error('Could not save new card zIndex', err); 
	    		cards.update(
	    			{_id: new ObjectId(data.cardId), board: board},
	    			{$set:{zIndex:data.zIndex}},
	    			{w:1},
	    			function(err, numberOfResults) {
		    			if (err) throw Error('Could not save new card zIndex', err);
		    			io.sockets.in(board).emit('card.zIndex', data);
		    		}
    		    );
        	});
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
        	db.collection('cards', function(err, cards) {
    			if (err) throw Error('Could not save new card content', err); 
	    		cards.update(
	    			{_id: new ObjectId(data.cardId), board: board},
	    			{$set:{content:sanitize(data.content).xss()}},
	    			{w:1},
	    			function(err, numberOfResults) {
		    			if (err) throw Error('Could not save new card content', err);
		    		}
    		    );
        	});
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
		io.sockets.in('').emit('totals', totals);
	}
	getTotalCardCount = function() {
		try {
	        db.collection('cards', function(err, cards) {
	        	cards.count(function(err, count) {
	        		if (err) throw err;
	        		totals.cards = count;
	        		sendTotals();
	        	});
	        });
		} catch (e) {
		  	console.log(e);
		}	
	}
	getTotalBoardCount = function() {
		try {
	        db.collection('boards', function(err, boards) {
	        	boards.count(function(err, count) {
	        		if (err) throw err;
	        		totals.boards = count;
	        		sendTotals();
	        	});
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

var getAccessLevel = function(board, password) {
	if (typeof(board.access) == 'undefined') {
        console.log("User has access level 'admin', due to no password");
        return access.ADMIN;
    } else if ((typeof(board.access.admin) != 'undefined') && (board.access.admin == password)) {
    	console.log("User has access level 'admin'");
        return access.ADMIN;
    } else if ((typeof(board.access.write) != 'undefined') 
        && (board.access.write == password)) {
        console.log("User has access level 'write'");
        return access.WRITE;	        
    } else if (typeof(board.access.read) != 'undefined' 
        && (board.access.read == password)) {
        console.log("User has access level 'read'");
        return access.READ;        	
    } else if ((typeof(board.access.admin) == 'undefined') 
        && (typeof(board.access.write) == 'undefined')
        && (typeof(board.access.read) == 'undefined')) {
        console.log("User has access level 'admin', due to no password");
        return access.ADMIN;
    }
    return access.NONE;	        
}

var inArray = function(needle, haystack) {
	for (var i = 0; i < haystack.length; i++) {
		if (needle == haystack[i]) return true;
	}
	return false;
}
