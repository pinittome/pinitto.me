var database = require('../database').connection,
    utils    = require('../util'),
    sanitize = require('validator').sanitize,
    util     = require('util'),
    events   = require('events');

database.collection('boards', function(error, boards) {
	if (error) throw Error(error)
	
	boards.ensureIndex('lastLoaded', function() {});
    exports.db = boards;

    exports.setName = function(id, name, callback) {
    	boards.update(
			{_id: new utils.ObjectId(id.replace('/', ''))},
			{$set:{name:name}},
			{w:1},
			function(error, numberOfResults) {
    			callback(error)
    		}
	    );
    }
    
    exports.load = function(id, callback) {
    	boards.findOne({_id: new utils.ObjectId(id.replace('/', ''))}, function(error, board) {
		    if (error) return callback('Could not find board', null)
		    callback(null, board)
		});
    }
    
    exports.setAccess = function(id, access, callback) {
    	boards.update(
			{_id: new utils.ObjectId(id.replace('/', ''))},
			{$set:{access:access}},
			{w:1},
			function(error, numberOfResults) {
    			callback(error)
    		}
	    );
    }
});