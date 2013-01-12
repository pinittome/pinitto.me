var totals = require('./util').totals
    , io = require('./io').io
    , cardsDb = require('./database/cards').db
    , boardsDb = require('./database/boards').db;

exports.cardAdded = function() {
	++totals.cards;
	sendTotals();
}

exports.boardCreated = function() {
	++totals.boards;
	sendTotals();
}

exports.boardRemoved = function() {
	--totals.boards;
	sendTotals();
}

exports.cardAdded = function() {
	++totals.cards;
	sendTotals();
}

exports.cardRemoved = function() {
	--totals.cards;
	sendTotals();
}

sendTotals = function() {
	io.sockets.in('/').emit('totals', totals);
}

exports.getTotalCardCount = getTotalCardCount = function() {
	try {
    	cardsDb.count(function(err, count) {
    		if (err) throw err;
    		totals.cards = count;
    		sendTotals();
    	});
	} catch (e) {
	  	console.log(e);
	}	
}
exports.getTotalBoardCount = getTotalBoardCount = function() {
	try {
    	boardsDb.count(function(err, count) {
    		if (err) throw err;
    		totals.boards = count;
    		sendTotals();
    	});
	} catch (e) {
	  	console.log(e);
	}	
}
		
setInterval(getTotalCardCount, 60000);
setTimeout(function() {
	setInterval(getTotalBoardCount, 120000);
	getTotalBoardCount.call();
}, 30000);	
getTotalCardCount.call();
