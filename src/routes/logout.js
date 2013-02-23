var cloneextend = require('cloneextend')

exports.get = function(req, res) {
    res.clearCookie(config.cookie.key);
    req.session.destroy(function() {});
    res.redirect('/');
}