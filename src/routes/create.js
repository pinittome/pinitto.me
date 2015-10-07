var boardsDb = require('../database/boards').db,
    utils = require('../util'),
    a = require('../access'),
    statistics = require('../statistics'),
    async = require('async'),
    expressValidator = require('express-validator')

exports.get = function(req, res, options) {
    options.captcha  = { type: 'captcha' }
    if (config.captcha && config.captcha.type) options.captcha = config.captcha;
    if (options.captcha.type == 'recaptcha') {
        var Recaptcha = require('recaptcha').Recaptcha
    	var recaptcha = new Recaptcha(config.captcha.keys['public'], config.captcha.keys['private'], true)
    	options.captcha.form = recaptcha.toHTML()
    }
}

expressValidator.Filter.prototype.toSlug = function(){
  this.modify((this.str || '').toLowerCase().replace(/[^0-9A-Z\-]/ig, '-'))
  return this.str
}

exports.post = function(req, res, options, done) {
    options.captcha  = { type: 'captcha' }
    if (config.captcha && config.captcha.type)
        options.captcha = config.captcha

    if (options.captcha.type === 'recaptcha') {
        var Recaptcha = require('recaptcha').Recaptcha
    	var recaptcha = new Recaptcha(
    		config.captcha.keys['public'],
    		config.captcha.keys['private'],
    		{
    			remoteip:  req.connection.remoteAddress,
		        challenge: req.body.recaptcha_challenge_field,
		        response:  req.body.recaptcha_response_field
    		},
    		true
    	)
    	options.captcha.form = recaptcha.toHTML()
    }
    var captchaComplete = function(additionalErrors) {
    	var errors = req.validationErrors()
    	if (additionalErrors) {
    		if (!errors) errors = []
    		for (var i=0; i<additionalErrors.length; i++)
                    errors.push(additionalErrors[i])
    	}

	    if (errors) {
	        if (req.xhr) {
	            res.send({error: errors}, 500)
	            return
	       } else {
	            options.errors.create = JSON.stringify(errors)
	            options.values = JSON.stringify(req.body)
	            return done()
	       }
	    }
	    var save = function() {
	    	parameters['createdOn'] = parameters['lastLoaded'] = new Date()
		    boardsDb.insert(parameters, function(error, newBoard) {
		    	if (error) {
		    	    var errors = new Array()
		    	    errors.push({mainMessage: 'Unable to create board, please try again'})
		    	    console.error(errors, error)
		    	    options.errors.create = JSON.stringify(errors)
	                options.values = JSON.stringify(req.body)
                    return done()
		    	}
		        req.session.access = a.ADMIN
		        req.session.board  = newBoard.ops[0]._id
		        if (error) throw Error(error)
                statistics.boardCreated()
                if (parameters.slug) {
                    return res.redirect('/n/' + parameters.slug + '#')
                }
		        res.redirect('/' + newBoard.ops[0]._id + '#')
		    })
	    }
	    parameters = {
	    	owner: req.param('owner'),
	    	'access': {},
	    	grid: {
	    		position: req.param('grid-position'),
	    		size: req.param('grid-size')
	    	}
	    }
	    if (req.param('board-name').length !== 0)
            parameters.name = req.param('board-name')
        if (req.param('slug').length !== 0)
            parameters.slug = req.param('slug')

            async.parallel ([
                function(callback) {
                    if ('' == req.param('password-admin')) return callback(null, true)
                    utils.hashPassword(req.param('password-admin'), function(password) {
                        parameters['access']['admin'] = password
                        callback(null, true)
                    })
                },
                function(callback) {
                    if ('' == req.param('password-write')) return callback(null, true)
                    utils.hashPassword(req.param('password-write'), function(password) {
                        parameters['access']['write'] = password
                        callback(null, true)
                    })
                },
                function(callback) {
                    if ('' == req.param('password-read'))
                        return callback(null, true)
                    utils.hashPassword(req.param('password-read'), function(password) {
                        parameters['access']['read'] = password
                        callback(null, true)
                    })
                }
            ], function(error, results) {
                 save()
                 return
            })
    }
    req.assert('owner', 'Valid email address required').isEmail()
    req.assert('grid-position', 'Invalid card size increment selectd')
        .isIn(['none', 'small', 'medium', 'large'])
    req.assert('grid-size', 'Invalid card size increment selectd')
        .isIn(['none', 'small', 'medium', 'large'])
    req.sanitize('board-name')
    req.sanitize('slug').toSlug()
    req.sanitize('password-admin')

    var checkCaptcha = function(additionalErrors) {
        if (options.captcha.type === 'captcha') {
            req.assert('digits').is(req.session.captcha)
            captchaComplete(additionalErrors)
        } else if (options.captcha.type === 'recaptcha') {
            recaptcha.verify(function(success, error_code) {
                if (!success) return done([{
                    param: 'recaptcha_response_field',
                    msg: 'Captcha failed - please check and try again',
                    value: ''
                }])
                captchaComplete(additionalErrors)
            })
        } else {
            captchaComplete(additionalErrors)
        }
    }

    if (!req.param('slug') || (0 === req.param('slug').length)) {
        return checkCaptcha()
    }
    req.assert('slug', 'Must be 3 - 256 characters in length').len(3, 256)
    boardsDb.findOne({ slug: req.param('slug') }, function(error, board) {
        var errors = null
        if (error) {
            errors = []
            errors.push({
                param: 'slug',
                value: req.param('slug'),
                msg: 'Database error, please try again'
            })
        } else if (board) {
             errors = []
             errors.push({
                 param: 'slug',
                 value: req.param('slug'),
                 msg: 'Board with provided URL identifier already exists'
             })
        }
        checkCaptcha(errors)
    })

}
