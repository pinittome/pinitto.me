var crypto = require('crypto')

exports.inArray = function(needle, haystack) {
    for (var i = 0; i < haystack.length; i++) {
        if (needle == haystack[i]) return true
    }
    return false
}

var hasher = function(count, hash, sha1, callback) {
	if (count == 0) return callback(sha1)
	sha1.update(hash)
	setImmediate(function() { hasher(count-1, hash, sha1, callback) })
}

exports.hashPassword = function(password, callback) {
    var hash = config.passwordSalt + password + config.password.salt
    var sha1 = crypto.createHash('sha1')
    hasher(config.password.hashes, hash, sha1, function(password) {
    	callback(sha1.digest('hex'))
    })
}

exports.totals = { cards: 0, boards: 0, sockets: 0 }

exports.ObjectId = require('mongodb').ObjectID
