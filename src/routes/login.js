var boardsDb = require('../database/boards').db,
    totals = require('../util').totals,
    utils = require('../util'),
    a = require('../access')

exports.get = function(req, res, options) {
    if (!req.param('id')) return
    options.referrer = req.header('Referer')
    options.boardId  = req.param('id')
}

exports.post = function(req, res, options, done) {
    req.check('board').len(24)
    req.sanitize('board')
    req.sanitize('password')
    
    options.referrer = req.param('referrer')
    options.boardId = req.param('board')
    var errors = req.validationErrors()
    if (errors) {
        options.errors.login = errors
        return done()
    }
    req.session.captcha = null

    var id = req.param('board')
    boardsDb.findOne({_id: utils.ObjectId(id)}, function(error, board) {
        if (error || (typeof(board) == undefined)) {
            res.render(404, {title: 'Board not found'})
        }
        utils.hashPassword(req.param('password'), function(hash) {
        	if (!req.param('password'))
                    req.session.access = a.getLevel(board, false)
                else
                    req.session.access = a.getLevel(board, hash)
        	req.session.board  = id
        	var url = '/' + id
	        if (req.param('referrer')
	            && (req.param('referrer').split('/')[2] == req.headers.host)) {
	            url = req.param('referrer')	
	        }
	        if (req.session.access != a.NONE) {
                    console.log('User authenticated, sending them to ' + url)
	            res.redirect(url.replace('#login', '#'))
                    return
	        }
	        console.log("Password incorrect")
                options.boardId  = id
	        options.referrer = req.param('referrer')
	        options.errors.login = [ {
                    mainMessage: 'Incorrect password for this board'
                } ]
	        done()
        })
    })
}
