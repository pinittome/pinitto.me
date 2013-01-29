crypto = require('crypto');

exports.inArray = function(needle, haystack) {
    for (var i = 0; i < haystack.length; i++) {
        if (needle == haystack[i]) return true;
    }
    return false;
}

exports.hashPassword = function(password) {
    hash = config.passwordSalt + password + config.password.salt;
    sha1 = crypto.createHash('sha1');
    for (var i = 0; i < config.password.hashes; i++) {
        sha1.update(hash); 
    }
    return sha1.digest('hex');
}

exports.totals = { cards: 0, boards: 0, sockets: 0 };

exports.ObjectId = require('mongodb').ObjectID;