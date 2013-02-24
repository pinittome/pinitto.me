var cloneextend = require('cloneextend'),
    boardsDb = require('../database/boards').db,
    Recaptcha = require('recaptcha').Recaptcha,
    totals = require('../util').totals,
    utils = require('../util'),
    a = require('../access'),
    statistics = require('../statistics')

exports.get = function(req, res) {
    options          =  cloneextend.clone(config.project);
    options.pageName = 'Create a new board';
    options.totals   = totals;
    options.app      = config.app
    options.captcha  = { type: 'captcha' };
    if (config.captcha && config.captcha.type) options.captcha = config.captcha;
    if (options.captcha.type == 'recaptcha') {
    	var recaptcha = new Recaptcha(config.captcha.keys['public'], config.captcha.keys['private'], true);
    	options.captcha.form = recaptcha.toHTML();
    }
    res.render('create', options);
}

exports.post = function(req, res) {
    options          =  cloneextend.clone(config.project);
    options.pageName = 'Error creating board';
    options.totals   = totals;
    options.app      = config.app
    options.captcha  = { type: 'captcha' };
    if (config.captcha && config.captcha.type) options.captcha = config.captcha;
    if (options.captcha.type == 'recaptcha') {
    	var recaptcha = new Recaptcha(
    		config.captcha.keys['public'],
    		config.captcha.keys['private'],
    		{
    			remoteip:  req.connection.remoteAddress,
		        challenge: req.body.recaptcha_challenge_field,
		        response:  req.body.recaptcha_response_field
    		},
    		true
    	);
    	options.captcha.form = recaptcha.toHTML();
    }
    var done = function(additionalErrors) {
    	var errors = req.validationErrors();
    	if (additionalErrors) {
    		if (!errors) errors = [];
    		for (var i=0; i<additionalErrors.length; i++) errors.push(additionalErrors[i]);
    	}
	    if (errors) {
	        if (req.xhr) {
	            res.send({error: errors}, 500);
	            return;
	       } else {
	            options.errors = JSON.stringify(errors);
	            options.values = JSON.stringify(req.body);
	            res.render('create', options);
	            return;
	       }
	    }
	    var save = function() {
	    	parameters['createdOn'] = parameters['lastLoaded'] = new Date();
		    boardsDb.insert(parameters, function(error, newBoard) {
		    	if (error) {
		    		var errors = new Array()
		    		errors.push({mainMessage: 'Unable to create board, please try again'})
		    		console.error(errors)
		    		options.errors = JSON.stringify(errors);
	                options.values = JSON.stringify(req.body);
	                res.render('create', options);
	                return;
		    	}
		        req.session.access = a.ADMIN;
		        req.session.board  = newBoard[0]._id;
		        if (error) throw Error(error);
		        if (req.xhr) {
		            res.send({id: newBoard[0]._id}, 200);
		        } else {
		            res.redirect('/' + newBoard[0]._id);
		        }  
		        statistics.boardCreated();          
		    });
	    }
	    parameters = {
	    	owner: req.param('owner'),
	    	'access': {},
	    	grid: {
	    		position: req.param('grid-position'),
	    		size: req.param('grid-size')
	    	}
	    };
	    if (req.param('board-name') != '') parameters['name'] = req.param('board-name');
	    if (req.param('password-admin') != '') {                
	        parameters['access']['admin'] = utils.hashPassword(req.param('password-admin'), save);
	        return
	    }
	    save();
    }
    req.assert('owner', 'Valid email address required').isEmail();
    req.assert('grid-position', 'Invalid card size increment selectd')
        .isIn(['none', 'small', 'medium', 'large']);
    req.assert('grid-size', 'Invalid card size increment selectd')
        .isIn(['none', 'small', 'medium', 'large']);
    req.sanitize('board-name');
    req.sanitize('password-admin');
    if (options.captcha.type == 'captcha') {
        req.assert('digits').is(req.session.captcha);
        done();
    } else if (options.captcha.type == 'recaptcha') {
    	recaptcha.verify(function(success, error_code) {
    		if (!success) return done([{
    			param: 'recaptcha_response_field',
    			msg: 'Captcha failed - please check and try again',
    			value: ''
    		}]);
    		done();
    	});
    } else {
    	done();
    }
}