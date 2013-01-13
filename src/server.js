var express = require('express')
  , app = express()
  , engine = require('ejs-locals')
  , boardsDb = require('./database/boards').db
  , sessionStore = require('./database/session').store
  , totals = require('./util').totals
  , sanitize = require('validator').sanitize  
  , connect = require('connect')
  , Session = connect.middleware.session.Session
  , utils = require('./util')
  , access = require('./access');
  
exports.server = server = require('http').createServer(app);

server.listen(config.server.port);

forceSsl = function(req, res, next) {
    onlySecure = config.project.secure || false;
    if ((onlySecure == true) && (req.headers['x-forwarded-proto'] != 'https')) {
    	return res.redirect('https://' + req.host + req.originalUrl);
    }
    next();
}

app.configure(function(){
	app.use(express.cookieParser(config.cookie.secret)); 
    app.use(express.session({
    	key: config.cookie.key,
	    secret: config.cookie.secret,
	    store: sessionStore
	}));
	app.use(express.static(__dirname + '/../public'));
	app.use(require('connect').cookieParser(config.cookie.secret));
	app.use(forceSsl);
	app.set('views', __dirname + '/../views');
	app.set('view engine', 'ejs');
	app.use(express.bodyParser());
	app.use(require('express-validator'));
	app.use(require('captcha')({ url: '/img/captcha.jpg', color:'#0064cd', background: 'rgb(20,30,200)' }));
	app.use(express.methodOverride());
	app.use(express.favicon(__dirname + '/../public/favicon.ico'));
	app.use(app.router);
	app.use(express.logger);
	app.use(express.errorHandler({
		dumpExceptions: true, showStack: true
	}));
});

app.engine('ejs', engine);

app.get('/', function (req, res) { 
   // So ugly must fix!
   options          =  JSON.parse(JSON.stringify(config.project))
   options.totals   = totals
   options.pageName = 'Welcome to pinitto.me'
   options.app      = config.app
   res.render('index', options)
});

app.get('/login/*', function(req, res) {
	if (!req.params[0]) res.redirect('/')
	options          = JSON.parse(JSON.stringify(config.project))
	options.pageName = 'Authorisation for board access'
	options.totals   = totals
	options.app      = config.app
	options.referrer = req.header('Referer')
	options.boardId  = req.params[0]
	res.render('login', options)
});

app.get('/logout', function(req, res) {
	res.clearCookie(config.cookie.key);
    req.session.destroy(function() {});
	res.redirect('/');
});

app.get('/contact', function(req, res) {
    options          = JSON.parse(JSON.stringify(config.project));
    options.app      = config.app
	options.pageName = 'Contact Us';
	res.render('contact', options);
});
app.get('/about', function(req, res) {
	options          = JSON.parse(JSON.stringify(config.project));
	options.app      = config.app
	options.pageName = 'About ' + options.name;
	res.render('about', options);
});

app.post('/login/*', function(req, res) {
	req.check('board').len(24);
	req.sanitize('board');
	req.sanitize('password');
	
	options          = JSON.parse(JSON.stringify(config.project));
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
        req.session.access = require('./access').getLevel(board, utils.hashPassword(req.param('password')));
        req.session.board  = id;
        if (req.session.access != access.NONE) {
        	res.redirect('/' + id);
        	return;
        }
        options.errors = { 'error': 'Incorrect password for this board' };
        res.redirect('/login/' + id)
    });
});

app.get('/create', function(req, res) {
	options          =  JSON.parse(JSON.stringify(config.project));
	options.pageName = 'Create a new board';
	options.totals   = totals;
	options.app      = config.app
	res.render('create', options);
});
app.post('/create', function(req, res) {
	options          =  JSON.parse(JSON.stringify(config.project));
	options.pageName = 'Error creating board';
	options.totals   = totals;
	options.app      = config.app
	
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
 
	parameters = { owner: req.param('owner'), 'access': {}};
	if (req.param('board-name') != '') parameters['name'] = req.param('board-name');
	if (req.param('password-admin') != '') {    			
		parameters['access']['admin'] = utils.hashPassword(req.param('password-admin'));
	}
	boardsDb.insert(parameters, function(error, newBoard) {
		req.session.access = require('./access').ADMIN;
	    req.session.board  = newBoard[0]._id;
		if (error) throw Error(error);
		if (req.xhr) {
		    res.send({id: newBoard[0]._id}, 200);
		} else {
			res.redirect('/' + newBoard[0]._id);
		}  
		require('./statistics').boardCreated();  		
	});
});


// Anything else must be a board link
app.get('/*', function(req, res) {
	
	var id      = req.params[0];
	var board   = {};
    var options =  JSON.parse(JSON.stringify(config.project));
    options.app = config.app
   
	console.log("Trying to load board " + id);
	if (id.length != 24) {
		options.title   = 'Page not found'
		options.message = 'This page doesn\'t exist'
		options.type    = 'page'
		res.render(404, options)
		return;
	}
	boardsDb.findOne({_id: utils.ObjectId(id)}, function(error, board) {
		if (error) {
			options.title   = "Something is up with our datastore"
			options.message = "Something has gone around somewhere. Will have beat the sys admin again"
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
			&& utils.inArray(req.session.access, [require('./access').ADMIN, require('./access').READ, require('./access').WRITE])
		) {
			allowedAccess = true;		
		} else if (access.NONE != access.getLevel(board, "")) {
			allowedAccess = true;
		}
		console.log("User is allowed access: " + allowedAccess, board, req.session, id);
		if (false == allowedAccess) {
			return res.redirect('/login/' + id);
		}
		var cardsDb = require('./database/cards')
		cardsDb.fetch('/'+id, function(error, cards) {
			if (error) {
				options.title   = "Something is up with our datastore"
				options.message = "Something has gone around somewhere. Will have beat the sys admin again"
				options.type    = 'datastore'
				return res.render(500, options);
			}
			console.log('******', cards);
			name                = board.name || id
			options._layoutFile = 'layouts/board';
			options.boardId     = id;
			options.boardName   = name;
			options.cards       = cards;
			req.session.access  = req.session.access ? req.session.access : require('./access').ADMIN;
			req.session.board   = id;
			res.render('board', options);
		});
	});
});