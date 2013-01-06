var database = require('../database').connection,
    utils    = require('../util'),
    sanitize = require('validator').sanitize;

database.collection('boards', function(error, boards) {
	if (error) throw Error(error);
    exports.db = boards;

    exports.setName = function(id, name) {
    	boards.update(
			{_id: new utils.ObjectId(id.replace('/', ''))},
			{$set:{name:name}},
			{w:1},
			function(error, numberOfResults) {
    			if (error) throw Error('Could not save new board details', error);
    		}
	    );
    }
});