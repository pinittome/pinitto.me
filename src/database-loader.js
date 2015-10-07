var MongoClient = require('mongodb').MongoClient

var database = null

module.exports = function(callback) {
    if (database) {
        return callback(db)
    }
    url = 'mongodb://'
    if  (config.database.username && config.database.password) {
        url += config.database.username + ':' + config.database.password + '@'
    }
    url += config.database.host + ':'  + config.database.port
    url += '/' + config.database.name 
        + '?authMechanism=SCRAM-SHA-1&authSource=' + config.database.name
    console.log('connecting to DB ' + url)
    MongoClient.connect(url, function(error, db) {

            if (error) throw Error(error)
            database = db
            callback(db)

    })
}