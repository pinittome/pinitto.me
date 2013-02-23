var cloneextend = require('cloneextend'),
    boardsDb = require('../database/boards').db,
    utils = require('../util'),
    a = require('../access'),
    cardsDb = require('../database/cards')
    
exports.get = function(req, res) {
    
    var id      = req.params[0];
    var board   = {};
    var options =  cloneextend.clone(config.project);
    options.app = config.app
   
    console.log("Trying to load board " + id);
    if (id.length != 24) {
    	console.log('404 referrer: ' + req.header('Referer'));
        options.title   = 'Page not found'
        options.message = 'This page doesn\'t exist'
        options.type    = 'page'
        res.render(404, options)
        return;
    }
    boardsDb.findOne({_id: utils.ObjectId(id)}, function(error, board) {
        if (error) {
            options.title   = "Something is up with our datastore"
            options.message = "Something has gone around somewhere. Will have to poke the sys admin " + 
                "again, or put another coin in the meter!"
            options.type    = 'datastore'
            return res.render(500, options);
        }
        
        if (!board) {
            options.title   = "Board not found"
            options.message = "Can't find your board anywhere, are you sure you've got the ID right?"
            options.type    = 'board'
            return res.render(404, options);
        }
        
        allowedAccess = false;
        if (req.session.access 
            && req.session.board 
            && (id == req.session.board)
            && utils.inArray(req.session.access, [a.ADMIN, a.READ, a.WRITE])
        ) {
            allowedAccess = true;        
        } else if (a.NONE != a.getLevel(board, "")) {
            allowedAccess = true; 
        }

        if (false == allowedAccess) {
            return res.redirect('/login/' + id);
        }
        boardsDb.update({_id: utils.ObjectId(id)}, {$set: {lastUsed: new Date()}}, function(error, records) {
        	if (error) {
        		console.log("Error updating lastUsed for board " + id)
        		return res.redirect('/' + id + '?attempt=' (req.param('attempt') || 1));
        	}
	        cardsDb.fetch('/'+id, function(error, cards) {
	            if (error) {
	                options.title   = "Something is up with our datastore"
	                options.message = "Something has gone around somewhere. Will have to poke " +
	                    "the sys admin again, or put another coin in the meter!"
	                options.type    = 'datastore'
	                return res.render(500, options);
	            }
	            name                = board.name || id
	            options._layoutFile = 'layouts/board';
	            options.boardId     = id;
	            options.boardName   = name;
	            options.cards       = cards;
	            options.config      = {
	                grid: board.grid || { position: 'none', size: 'none' }	
	            }
	            req.session.access  = req.session.access ? req.session.access : a.ADMIN;
	            req.session.board   = id;
	            res.render('board', options);
	        });
	    });
    });
}