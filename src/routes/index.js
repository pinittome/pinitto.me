var cloneextend = require('cloneextend')
  , totals = require('../util').totals

exports.serve = function (req, res) {

   var options    = cloneextend.clone(config.project)
   options.totals = totals
   options.app    = config.app
   options.pageName = 'Welcome to pinitto.me'
   res.render('index', options)
}
