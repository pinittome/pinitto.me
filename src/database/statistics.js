var database = require('../database').connection,
    utils    = require('../util'),

database.collection('statistics', function(error, database) {
    if (error) throw Error(error)
	
    exports.db = database;

    exports.add = function(data, callback) {
    	database.insert(data, function(error) {
            callback(error);
        });
    }
}); 
