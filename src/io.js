var httpServer  = require('./server')
exports.io = io = require('socket.io').listen(httpServer.server)
var Session     = require('connect').middleware.session.Session
  , boards      = require('./database/boards')
  , cardsDb     = require('./database/cards')
  , statistics  = require('./statistics')
  , sanitizer   = require('./classes/sanitize/board')
  , access      = require('./access')

Board = require('./classes/board')
Card  = require('./classes/card')
Acl   = require('./classes/acl')

io.configure(function (){
    io.set('authorization', function(data, accept) {
        if (!data.headers.cookie) {
            return accept('No cookie received', true)
        }
        data.cookies      = require('cookie').parse(data.headers.cookie)
        data.cookies      = require('cookie').parse(data.headers.cookie, config.cookie.secret)
        data.sessionID    = data.cookies['connect.sid'].split('.')[0].split(':')[1]
        data.sessionStore = require('./database/session').store
        require('./database/session').store.get(data.sessionID, function(error, session) {
            if (error || !session) {
                console.log('ERROR', error)
                console.log('session:', session)
                return accept('No session', false)
            }
            data.session = new Session(data, session)
            data.session.save()
            accept(null, true)
        })
    })
    io.set('transports', config.transports)
});

if (environment === 'production') {
    io.configure('production', function() {
        io.enable('browser client minification') // send minified client
        io.enable('browser client etag')         // apply etag caching logic based on version number
        io.enable('browser client gzip')         // gzip the file
        io.set('log level', 1)                   // reduce logging
        
        io.set('transports', config.transports)
    })
}

io.sockets.on('connection', function (socket) {

    statistics.socketOpened()
    
    var sessionStore = require('./database/session').store
    var user         = require('./classes/user')
    var acl          = new Acl(socket)

    var board = new Board()
    board.setSanitizer(sanitizer)
    board.setParams(boards, sessionStore, cardsDb)
 
    sessionStore.get(socket.handshake.sessionID, function(error, session) {
        if (error) {
            console.error(error)
            return socket.emit(
                'error', 
                { message: 'Something went wrong! Please refresh and try again' }
            )
        }
        acl.setCurrentLevel(session.access)
    })
    
    var card = new Card(board)
    card.setIo(io)

    socket.on('statistics.join', function() {
        socket.join('/')
    });
     
    socket.on('disconnect', function() {
    	socket.get('board', function(error, board) {
    		if (error) return
	        socket.broadcast.to(board).emit('user.leave', {userId: socket.id})
	        statistics.socketClosed()
	    })
    })

    socket.on('card.create', function(data) {
        if (!acl.hasPermission(access.WRITE)) return
        card.setSocketContext(this)
        card.create(data)
    })
    socket.on('card.moved', function(data) {
        if (!acl.hasPermission(access.WRITE)) return
        card.setSocketContext(this)
        card.moved(data)
    })
    socket.on('card.resize', function(data) {
        if (!acl.hasPermission(access.WRITE)) return
        card.setSocketContext(this)
        card.resize(data)
    })
    socket.on('card.delete', function(data) {
        if (!acl.hasPermission(access.WRITE)) return
        card.setSocketContext(this)
        card.remove(data)
    })
    socket.on('card.colour', function(data) {
        if (!acl.hasPermission(access.WRITE)) return
        card.setSocketContext(this)
        card.changeColour(data)
    })
    socket.on('card.zIndex', function(data) {
        if (!acl.hasPermission(access.WRITE)) return
        card.setSocketContext(this)
        card.stackOrder(data)
    })
    socket.on('card.moving', function(data) {
        if (!acl.hasPermission(access.WRITE)) return
        card.setSocketContext(this)
        card.moving(data)
    })
    socket.on('card.text-change', function(data) {
        if (!acl.hasPermission(access.WRITE)) return
    	card.setSocketContext(this)
        card.textChange(data)
    })

    socket.on('user.name.set', function(data) {
        if (!acl.hasPermission(access.READ)) return
        user.setSocketContext(this)
        user.setName(data)
    })

    socket.on('board.name.set', function(data) {
        if (!acl.hasPermission(access.ADMIN)) return
        board.setSocketContext(this)
        board.setName(data)
    })
    socket.on('board.access.set', function(data) {
        if (!acl.hasPermission(access.ADMIN)) return
        board.setSocketContext(this)
        board.setAccess(data)
    })
    socket.on('board.join', function(data) {
        if (!acl.hasPermission(access.READ)) return
        board.setSocketContext(this)
        board.join(data)
    })
    socket.on('board.leave', function(data) {
        board.setSocketContext(this)
        board.leave(data)
    })
    socket.on('board.grid.size', function(data) {
        if (!acl.hasPermission(access.ADMIN)) return
    	board.setSocketContext(this)
    	board.setSizeGrid(data)
    })
    socket.on('board.grid.position', function(data) {
        if (!acl.hasPermission(access.ADMIN)) return
    	board.setSocketContext(this)
    	board.setPositionGrid(data)
    })
})
