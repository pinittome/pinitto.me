var cloneextend = require('cloneextend'),
    totals = require('../util').totals

exports.get = function (req, res) { 
   options          = cloneextend.clone(config.project)
   options.totals   = totals
   options.pageName = 'Welcome to pinitto.me'
   options.app      = config.app
   res.render('index', options)
}