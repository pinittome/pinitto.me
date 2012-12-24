environment = process.env.NODE_ENV || 'production';

config = require('./config.' + environment + '.js');
config.cookie.key = 'connect.sid';

httpServer = require('./src/server');
require('./src/io');