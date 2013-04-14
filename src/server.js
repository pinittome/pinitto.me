var express = require('express')
  , app = express()
  , engine = require('ejs-locals')
  , sessionStore = require('./database/session').store
  , connect = require('connect')
  , Session = connect.middleware.session.Session
  , forceDomain = require('express-force-domain')
  
exports.server = server = require('http').createServer(app);

server.listen(config.server.port);

forceSsl = function(req, res, next) {
    onlySecure = config.project.secure || false;
    if ((onlySecure == true) && (req.headers['x-forwarded-proto'] != 'https')) {
        return res.redirect(301, 'https://' + req.host + req.originalUrl);
    }
    next();
}

app.configure(function(){
    app.use(express.cookieParser(config.cookie.secret)); 
    app.use(express.session({
        key: config.cookie.key,
        secret: config.cookie.secret,
        store: sessionStore
    }))
    app.use(express.static(__dirname + '/../public'))
    app.use(require('connect').cookieParser(config.cookie.secret))
    
    if (config.server && config.server.domain && config.server.domain != '')
        app.use(forceDomain(config.server.domain))

    app.use(forceSsl)
    app.set('views', __dirname + '/views')
    app.set('view engine', 'ejs')
    app.use(express.bodyParser())
    app.use(require('express-validator'))
    app.use(express.methodOverride())
    app.use(express.favicon(__dirname + '/../public/favicon.ico'))
    app.use(app.router)
    app.use(express.logger)
    var errors = false
    if ('development' == environment) errors = true
    app.use(express.errorHandler({
        dumpExceptions: errors, showStack: errors
    }))
    app.engine('ejs', engine)
    if ('captcha' == config.captcha.type) {
        app.use(require('captcha')({
            url: '/img/captcha.jpg',
            color:'#0064cd',
            background: 'rgb(20, 30, 200)'
        }))
    }
});

app.get('/', require('./routes/index').get);
app.get('/contact', require('./routes/contact').get);
app.get('/about', require('./routes/about').get);
app.get('/features', require('./routes/features').get);

app.get('/login/*', require('./routes/login').get);
app.post('/login/*', require('./routes/login').post);
app.get('/logout', require('./routes/logout').get);

app.get('/create', require('./routes/create').get);
app.post('/create', require('./routes/create').post);

// Anything else must be a board link
app.get('/*', require('./routes/catch-all').get);
