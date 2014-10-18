var mongo = require('mongodb')

exports.connection = db = new mongo.Db(
    config.database.name, 
    new require('mongodb').Server(
        config.database.host,
        config.database.port,
        {}
    ),
    { auto_reconnect: true, safe: true },
    { strict: false }
);

database = db.open(function(error, pClient) {
    if (error) throw Error(error)
    if (config.database.username) {
        db.authenticate(config.database.username, config.database.password, function (error, replies) {
            if (error) throw Error(error)
            console.log('Successfully connected to database')
        })
    } else {
        console.log('Successfully connected to database (no auth requested)')
    }
})