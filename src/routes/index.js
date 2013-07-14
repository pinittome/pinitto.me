var cloneextend = require('cloneextend')
  , totals = require('../util').totals
  , create = require('./create')
  , login  = require('./login')

exports.serve = function (req, res) {

   var options    = cloneextend.clone(config.project)
   options.totals = totals
   options.app    = config.app
   options.pageName = 'Welcome to pinitto.me'
 
   if (req.param('logout')) {
       res.clearCookie(config.cookie.key)
       req.session.destroy(function() {})
       return res.redirect('/')
   }
   var requestsToHandle = false
   var done = function() {
       res.render('index', options)
   }

   if ('create' === req.param('form')) {
       create.post(req, res, options, done)
       requestsToHandle = true
   } else {
       create.get(req, res, options)
   }
   if ('login' === req.param('form')) {
       login.post(req, res, options, done)
       requestsToHandle = true
   } else {
       login.get(req, res, options)
   }
   if (false == requestsToHandle) done()
}
