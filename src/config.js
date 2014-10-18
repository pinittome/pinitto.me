module.exports = function(data) {

	/**
	 * Read in config file and tidy up data
	 * Prefer application to require minimum config as possible
	 */
	var config = require('../config.' + environment + '.js');

	if (!config.server) config.server = {
	    port: 3000
	}

    if (!config.app) config.app = {}
	if (!config.cookie) config.cookie = {}
    
    if (!config.cookie.secret) {
        config.cookie.secret = 'do-not-tell'
        console.log('No cookie secret set'.red)   
    }
    
    if (!config.password) config.password = {}
    if (!config.password.salt) {
        config.password.salt = ''
        console.log('No password salt set'.red)
    }
    if (!config.password.hashes) {
        config.password.hashes = 20
    }

	config.cookie.key = 'connect.sid';

	if (!config.app.useOptimised) {
	    config.app.useOptimised = ('development' == environment) ? false : true;
	}

	if (!config.project) config.project = {
	    name: "PinItTo.me"
	  , title: "Welcome!"
	  , _layoutFile: 'layouts/main'
	  , pageName: 'Index'
	}

	if (!config.captcha) {
	    config.captcha = {
	        type: 'captcha'
	    }
	}

	if (!config.transports || (0 == config.transports.length))
	    config.transports = config.transports || ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']

	config.app.version = data.version
	config.app.environment = environment

    config.project.errors = {}

    config.project.captcha = ''

    if (!config.app.limits) {
        config.app.limits = {
            card: {
                wait: 0.5
            }
        }
    }

	return config
}