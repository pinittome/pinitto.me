httpServer = require('./server');
exports.io = io = require('socket.io').listen(httpServer.server);
Session    = require('connect').middleware.session.Session;
boardsDb   = require('./database/boards');
cardsDb    = require('./database/cards');

io.configure(function (){
    io.set('authorization', function(data, accept) {
	    if (!data.headers.cookie) {
	    	accept(null, true);
	    }
        data.cookies      = require('cookie').parse(data.headers.cookie);
        data.cookies      = require('cookie').parse(data.headers.cookie, config.cookie.secret);
        data.sessionID    = data.cookies['connect.sid'].split('.')[0].split(':')[1];
        data.sessionStore = require('./session').store;

        require('./session').store.get(data.sessionID, function(error, session) {
	        if (error || !session) {
	            console.log("ERROR", err);
	            console.log("session:", session);
	        }
	        data.session = new Session(data, session);
	        data.session.save();
	        accept(null, true);
        });
	});
});

io.sockets.on('connection', function (socket) {
    
    socket.on('statistics.join', function() {
    	socket.join('/');
    });
     
    socket.on('disconnect', function() {
    	socket.get('board', function(error, board) {
    		if (error) throw Error('Error on user disconnect', error); 
	        socket.broadcast.to(board).emit('user.leave', {userId: socket.id});
	    });
    });
    
    user  = require('./classes/user')(socket, cardsDb);
    board = require('./classes/board')(socket, boardsDb, require('./session').store, cardsDb);
    card  = require('./classes/card')(socket, cardsDb);
    
    socket.on('card.create', card.create);
    socket.on('card.moved', card.moved);
    socket.on('card.resize', card.resize);
    socket.on('card.delete', card.remove);
    socket.on('card.colour', card.changeColour);    
    socket.on('card.zIndex', card.stackOrder);
    socket.on('card.moving', card.moving);
    socket.on('card.text-change', card.textChange);

	socket.on('user.name.set', user.setName);
	
    socket.on('board.name.set', board.setName);
    socket.on('board.join', board.join);
    socket.on('board.leave', board.leave);
});