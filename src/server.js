var express = require('express')
  , app = express()
  , engine = require('ejs-locals')
  , sessionStore = require('./database/session').store
  , connect = require('connect')
  , Session = connect.middleware.session.Session
  , forceDomain = require('express-force-domain')
  , sts = require('connect-sts')

exports.server = server = require('http').createServer(app)

var environment = process.env.NODE_ENV || 'production'

var server = exports.server = require('http').createServer(app)

var maxAge = ('development' === environment) ? 0 : 31557600000

var onlySecure = config.project.secure || false
var forceSsl = function(req, res, next) {
    if ((onlySecure === true) && (req.headers['x-forwarded-proto'] !== 'https')) {
        return res.redirect(301, 'https://' + req.host + req.originalUrl)
    }
    next()
}

app.configure(function(){
    app.use(express.favicon(__dirname + '/../public/favicon.ico'))
    app.use(express.static(__dirname + '/../public', { maxAge: maxAge }))
    require('helmet').defaults(app)
    app.use(express.cookieParser(config.cookie.secret))
    app.use(express.session({
        key: config.cookie.key,
        secret: config.cookie.secret,
        store: sessionStore,
        httpOnly: true,
        secure: onlySecure
    }))
    app.use(sts(3600000 * 24 * 365, false))
    app.use(require('connect').cookieParser(config.cookie.secret))
    app.disable('x-powered-by')

    if (config.server && config.server.domain && (config.server.domain !== '')) {
        app.use(forceDomain(config.server.domain))
    }

    app.use(forceSsl)
    if ('captcha' === config.captcha.type) {
        console.log('Loading captcha...')
        app.use(require('captcha')({
            url: '/img/captcha.jpg',
            color:'#0064cd',
            background: 'rgb(20, 30, 200)'
        }))
    }
    app.set('views', __dirname + '/views')
    app.set('view engine', 'ejs')
    app.use(express.bodyParser())
    app.use(require('express-validator'))
    app.use(express.methodOverride())
    app.use(app.router)
    var errors = false
    if ('development' === environment) {
        errors = true
    }
    app.use(express.errorHandler({
        dumpExceptions: errors,
        showStack: errors
    }))
    app.engine('ejs', engine)
})

app.get('/', require('./routes/index').serve)
app.post('/', require('./routes/index').serve)

app.get('/contact', function(req, res) {
    res.redirect('http://go.pinitto.me/contact')
})
app.get('/about', function(req, res) {
    res.redirect('http://go.pinitto.me/about')
})
app.get('/features', function(req, res) {
    res.redirect('http://go.pinitto.me/features')
})

app.get('/login/*', function(req, res) {
    res.redirect('/#login' + req._parsedUrl.search)
})
app.post('/login/*', require('./routes/login').post)
app.get('/logout', function(req, res) {
    res.redirect('/?logout=1')
})

app.get('/create', function(req, res) {
    res.redirect('/#create')
})

// Anything else must be a board link
app.get('/*', require('./routes/catch-all').get)
