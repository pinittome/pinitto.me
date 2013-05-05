module.exports = function(data) {

	/**
	 * Read in config file and tidy up data
	 * Prefer application to require minimum config as possible
	 */
	var config = require('../config.' + environment + '.js');
	
	if (!config.server) config.server = {
	    port: 3000
	}
	
	if (!config.cookie) config.cookie = {}
	
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
	
	config.app.version = data.version;
	config.app.environment = environment;
	    
	return config
}
