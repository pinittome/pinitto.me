var db       = require('../database').connection(),
    utils    = require('../util.js');

db.collection('cards', function(error, cards) {
    if (error) throw Error('Can not load cards collection')

    cards.ensureIndex('board', function() {});
    exports.db = cards;
    
    exports.add = function(data, callback) {
        cards.insert(data, function(error, result) {        
            callback(error, result);
        });
    }
    
    exports.updatePosition = function(data, board, callback) {
        cards.update(
            {_id: new utils.ObjectId(data.cardId), board: board},
            {$set:{position:data.position}},
            {w:1},
            function(error, result) {
                var numberOfResults = result.result.nModified
                if (error || (numberOfResults != 1)) {
                	console.log(error);
                    error ='Could not save new card position'
                }
                callback(error);
            }
        );
    }
    
    exports.updateSize = function(data, board, callback) {
        cards.update(
            {_id: new utils.ObjectId(data.cardId), board: board},
            {$set:{size:data.size}},
            {w:1},
            function(error, numberOfResults) {
                if (error || (numberOfResults != 1)) {
                	console.log(error, data.cardId, board, data.size);
                	error = 'Could not save new card size';
                }
                callback(error)
            }
        );
    }
    
    exports.remove = function(data, board, callback) {
        cards.remove(
            {_id: new utils.ObjectId(data.cardId), board: board},
            {w:1},
            function(error, numberOfResults) {
                if (error || (numberOfResults != 1)) {
                	console.log(error);
                	error = 'Deletion not saved to datastore';
                }
                callback(error);
            }
        );
    }
    
    exports.updateColour = function(data, board, callback) {
        cards.update(
            {_id: new utils.ObjectId(data.cardId), board: board},
            {$set:{cssClass:data.cssClass}},
            {w:1},
            function(error, numberOfResults) {
                if (error) error = 'Could not update card colour'
                callback(error)
            }
        );
    }
    
    exports.updateOrder = function(data, board, callback) {
        cards.update(
            {_id: new utils.ObjectId(data.cardId), board: board},
            {$set:{zIndex:data.zIndex}},
            {w:1},
            function(error, numberOfResults) {
                if (error) error = 'Could not save new card zIndex'
                callback(error);
            }
        );
    }
    
    exports.updateContent = function(data, board, callback) {
        cards.update(
            {_id: new utils.ObjectId(data.cardId), board: board},
            {$set:{content:data.content}},
            {w:1},
            function(error, numberOfResults) {
                if (error) error = 'Could not save new card content';
                callback(error)
            }
        );
    }
    
    exports.fetch = function(boardId, callback) {
        if (boardId.length != 25) return callback("Invalid board ID provided", []);
        cards.find({board: boardId}).batchSize(10).toArray(function(error, cards) {
            if (error) callback('Can not load cards', null)
            callback(null, cards)
        });
    }
});