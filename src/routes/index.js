var cloneextend = require('cloneextend'),
    totals = require('../util').totals

exports.get = function (req, res) {
   if (req.param('logout')) {
       res.clearCookie(config.cookie.key)
       req.session.destroy(function() {})
       return res.redirect('/')
   }
   options          = cloneextend.clone(config.project)
   options.totals   = totals
   options.pageName = 'Welcome to pinitto.me'
   options.app      = config.app
   res.render('index', options)
}