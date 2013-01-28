var totals = require('./util').totals
    , io = require('./io').io
    , cardsDb = require('./database/cards').db
    , boardsDb = require('./database/boards').db
    , util = require('util')
    , events = require('events')
    , statisticsDb = require('./database/statistics').db;

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
exports.socketClosed = function() {
	--totals.sockets;
	sendTotals();
}
exports.socketOpened = function() {
	++totals.sockets;
	sendTotals();
}

sendTotals = function() {
    totals.memoryUsage = process.memoryUsage();
    totals.uptime      = process.uptime();

    io.sockets.in('/').emit('totals', totals);
}

var saveTotals = function() {
    statisticsDb.add(totals, function(error) {
        if (error) throw Error(error);
    });
}

exports.getTotalCardCount = getTotalCardCount = function() {
    try {
    	cardsDb.count(function(error, count) {
            if (error) return;
    	    totals.cards = count;
    	    sendTotals();
    	});
    } catch (e) {
        console.log(e);
    }	
}

exports.getTotalBoardCount = getTotalBoardCount = function() {
    try {
        boardsDb.count(function(error, count) {
    	    if (error) return;
    	    totals.boards = count;
    	    sendTotals();
        });
    } catch (e) {
        console.log(e);
    }	
}

setInterval(getTotalCardCount, 30000);
setTimeout(function() {
    setInterval(getTotalBoardCount, 30000);
    getTotalBoardCount.call();
}, 15000);	
setTimeout(function() {
    setInterval(saveTotals, 30000)
}, 30000);

getTotalCardCount.call();
