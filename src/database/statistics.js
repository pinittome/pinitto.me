var database = require('../database').connection(),
    utils    = require('../util');

database.collection('statistics', function(error, db) {
    if (error) throw Error(error)
    
    exports.db = db;

    exports.add = function(data, callback) {
        db.insert(data, function(error) {
            callback(error);
        });
    }
}); 
