var mongo = require('mongodb');

var db = new mongo.Db(
	config.database.name, 
	new require('mongodb').Server(
		config.database.host,
		config.database.port,
		{}
	),
	{auto_reconnect: true, safe: true},
	{strict: false}
);
database = db.open(function(err, pClient) {
    if (err) throw err;
    if (config.database.username) {
    	db.authenticate(config.database.username, config.database.password, function (err, replies) {
    		if (err) throw err;
    		console.log("Successfully connected to database");
    	});
    } else {
    	console.log("Successfully connected to database (no auth requested)");
    }
});

exports.connection = db;