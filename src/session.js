var MongoStore = require('connect-mongo')(require('express'));

exports.store = new MongoStore({
    db: config.database.name,
    port: config.database.port,
    host: config.database.host,
    username: config.database.username,
    password: config.database.password,
    collection: config.cookie.table,
    clear_interval: config.cookie.clearAfter,
    auto_reconnect: true
});
