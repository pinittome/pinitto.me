var MongoStore = require('connect-mongo')(require('express'))
  , db       = require('../database').connection()

exports.store = new MongoStore({
    db: db,
    autoRemove: 'native' // Default 
});