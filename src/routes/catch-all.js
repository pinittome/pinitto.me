var cloneextend = require('cloneextend'),
    boardsDb = require('../database/boards').db,
    utils = require('../util'),
    a = require('../access'),
    cardsDb = require('../database/cards'),
    totals = require('../util').totals

var request
  , response
  , options

var loadedBoard = function(error, board) {
    if (error) {
        options.title   = 'Something is up with our datastore'
        options.message = 'Something has gone around somewhere. Will have to poke the sys admin ' +
            'again, or put another coin in the meter!'
        options.type    = 'datastore'
        return response.render(500, options)
    }
    if (!board) {
        options.title   = "Board not found"
        options.message = "Can't find your board anywhere, are you sure you've got the ID right?"
        options.type    = 'board'
        return response.render(404, options)
    }
    var id = board._id.toString()
    allowedAccess = false
    if (request.session.access
        && request.session.board
        && (id == request.session.board)
        && utils.inArray(request.session.access, [a.ADMIN, a.READ, a.WRITE])
    ) {
        allowedAccess = true
    } else if (a.NONE != a.getLevel(board, false)) {
        allowedAccess = true
    }

    if (false == allowedAccess)
        return response.redirect('/?id=' + id.split('#')[0] + '#login')

    boardsDb.update({_id: utils.ObjectId(id)}, { $set: { lastUsed: new Date() } }, function(error, records) {
        if (error) {
            console.log("Error updating lastUsed for board " + id)
            return response.redirect('/' + id + '?attempt=' (request.param('attempt') || 1))
        }
        cardsDb.fetch('/' + id, function(error, cards) {
            if (error) {
                options.title   = "Something is up with our datastore"
                options.message = "Something has gone around somewhere. Will have to poke " +
                    "the sys admin again, or put another coin in the meter!"
                options.type    = 'datastore'
                return response.render(500, options)
            }
            name                = board.name || id
            options._layoutFile = 'layouts/board'
            options.boardId     = id
            options.boardName   = name
            options.cards       = cards
            options.config      = {
                grid: board.grid || { position: 'none', size: 'none' }
            }
            request.session.access  = request.session.access ?
                    request.session.access : a.getLevel(board, false)
            request.session.board   = id
                options.access      = request.session.access
            response.render('board', options)
        })
    })
}

exports.get = function(req, res) {

    var name
    var id = req.params[0]
    if ('n' === req.path.split('/')[1]) {
        name = req.path.split('/')[2]
        id = null
    }
    var board = {}
    options =  cloneextend.clone(config.project)
    options.app = config.app
    options.totals = totals

    if (!name && (id.length !== 24)) {
    	console.log('404 referrer: ' + req.header('Referer'))
        options.title   = 'Page not found'
        options.message = 'This page doesn\'t exist'
        options.type    = 'page'
        res.render(404, options)
        return
    }
    request = req
    response = res
    if (!name) {
        console.log("Trying to load board: " + id)
        boardsDb.findOne({_id: utils.ObjectId(id)}, loadedBoard)
    } else {
        console.log("Trying to load board with slug: " + name)
        boardsDb.findOne({ slug: name }, loadedBoard)
    }
}
