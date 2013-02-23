var cloneextend = require('cloneextend'),
    boardsDb = require('../database/boards').db,
    totals = require('../util').totals,
    utils = require('../util'),
    a = require('../access')

exports.get = function(req, res) {
    if (!req.params[0]) res.redirect('/')
    options          = cloneextend.clone(config.project)
    options.pageName = 'Authorisation for board access'
    options.totals   = totals
    options.app      = config.app
    options.referrer = req.header('Referer')
    options.boardId  = req.params[0]
    res.render('login', options)
}

exports.post = function(req, res) {
    req.check('board').len(24);
    req.sanitize('board');
    req.sanitize('password');
    
    options          = cloneextend.clone(config.project);
    options.app      = config.app
    options.pageName = 'Authorisation for board access';
    options.totals   = totals;
    
    var errors = req.validationErrors();
    if (errors) {
        options.errors = JSON.stringify(errors);
        res.render('login', options);
        return;
    }
    req.session.captcha = null;

    var id = req.param('board');
    boardsDb.findOne({_id: utils.ObjectId(id)}, function(error, board) {
        if (error || (typeof(board) == undefined)) {
            res.render(404, {title: 'Board not found'})
        }
        utils.hashPassword(req.param('password'), function(hash) {
        	req.session.access = a.getLevel(board, hash);
        	req.session.board  = id;
	        if (req.session.access != a.NONE) {
	            res.redirect('/' + id);
	            return;
	        }
	        options.errors = { 'error': 'Incorrect password for this board' };
	        res.redirect('/login/' + id)
        })
    });
}