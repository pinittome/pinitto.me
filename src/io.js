var httpServer = require('./server');
exports.io = io = require('socket.io').listen(httpServer.server);
var Session    = require('connect').middleware.session.Session;
var boards     = require('./database/boards');
var cardsDb    = require('./database/cards');
var statistics = require('./statistics');
var sanitizer = require('./classes/sanitize/board');

Board = require('./classes/board');
Card  = require('./classes/card');

io.configure(function (){
    io.set('authorization', function(data, accept) {
        if (!data.headers.cookie) {
            return accept('No cookie received', true);
        }
        data.cookies      = require('cookie').parse(data.headers.cookie);
        data.cookies      = require('cookie').parse(data.headers.cookie, config.cookie.secret);
        data.sessionID    = data.cookies['connect.sid'].split('.')[0].split(':')[1];
        data.sessionStore = require('./database/session').store;
        require('./database/session').store.get(data.sessionID, function(error, session) {
            if (error || !session) {
                console.log("ERROR", error);
                console.log("session:", session);
                return accept('No session', false);
            }
            data.session = new Session(data, session);
            data.session.save();
            accept(null, true);
        });
    });
    if (config.transports) {
        io.set('transports', config.transports);
    }
});

if (environment == 'production') {
    io.configure('production', function(){
        io.enable('browser client minification');  // send minified client
        io.enable('browser client etag');          // apply etag caching logic based on version number
        io.enable('browser client gzip');          // gzip the file
        io.set('log level', 1);                    // reduce logging
        transports = config.transports || ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']
        io.set('transports', transports);
    });
}

io.sockets.on('connection', function (socket) {

    statistics.socketOpened()
    
    var user  = require('./classes/user');
       
    var board = new Board()    
    board.setSanitizer(sanitizer)
    board.setParams(boards, require('./database/session').store, cardsDb);
    
    var card = new Card()
    card.setIo(io);

    socket.on('statistics.join', function() {
        socket.join('/');
    });
     
    socket.on('disconnect', function() {
    	board.setSocketContext(this);
        board.leave();
    });
    
    socket.on('card.create', function(data) {
        card.setSocketContext(this);
        card.create(data);
    });
    socket.on('card.moved', function(data) {
        card.setSocketContext(this);
        card.moved(data)
    });
    socket.on('card.resize', function(data) {
        card.setSocketContext(this);
        card.resize(data)
    });
    socket.on('card.delete', function(data) {
        card.setSocketContext(this);
        card.remove(data)
    });
    socket.on('card.colour', function(data) {
        card.setSocketContext(this);
        card.changeColour(data);
    });    
    socket.on('card.zIndex', function(data) {
        card.setSocketContext(this);
        card.stackOrder(data)
    });
    socket.on('card.moving', function(data) {
        card.setSocketContext(this);
        card.moving(data)
    });
    socket.on('card.text-change', function(data) {
        card.textChange(data)
    });

    socket.on('user.name.set', function(data) {
        user.setSocketContext(this)
        user.setName(data)
    });

    socket.on('board.name.set', function(data) {
        board.setSocketContext(this);
        board.setName(data)
    });
    socket.on('board.access.set', function(data) {
        board.setSocketContext(this);
        board.setAccess(data)
    })
    socket.on('board.join', function(data) {
        board.setSocketContext(this);
        board.join(data);
    });
    socket.on('board.leave', function(data) {
        board.setSocketContext(this);
        board.leave(data)
    });
});
