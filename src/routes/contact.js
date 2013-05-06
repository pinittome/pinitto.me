var cloneextend = require('cloneextend')

exports.get = function(req, res) {
    options          = cloneextend.clone(config.project);
    options.app      = config.app
    options.pageName = 'Contact Us';
    res.render('contact', options);
}