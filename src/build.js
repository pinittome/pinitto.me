var requirejs = require('requirejs')

if ('development' === process.env.NODE_ENV) return

var applicationConfig = {
    baseUrl: './public/js',
    name: 'app',
    out: './public/app.' + config.app.version + '.js',
    mainConfigFile: './public/js/app.js',
    paths: {
        'socket.io': 'empty:',
        'requireLib': 'require'
    },
    include: [
    	'requireLib'
    ]
};

var mainConfig = {
    baseUrl: './public/js',
    name: 'main',
    out: './public/main.' + config.app.version + '.js',
    mainConfigFile: './public/js/main.js',
    paths: {
        'socket.io': 'empty:',
        'requireLib': 'require'
    },
    include: [
    	'requireLib'
    ]
};

requirejs.optimize(applicationConfig, function (log) {
	console.log("Application javascript optimisation complete".green);
	if ('string' === typeof(log)) return console.log((log).cyan)
        console.log(log)
}, function(error) {
    console.log(("Error optimizing javascript: " + error).red);
})

requirejs.optimize(mainConfig, function (log) {
    console.log("Main javascript optimisation complete".green)
    if ('string' === typeof(log)) return console.log((log).cyan)
    console.log(log)
}, function(error) {
    console.log(("Error optimizing javascript: " + error).red);
})

var cssConfig = {
	cssIn: './public/css/main.css',
	out: './public/app.' + config.app.version + '.css',
	optimizeCss: 'standard'
};
requirejs.optimize(cssConfig, function(log) {
	console.log(("Application CSS optimisation complete").green);
	console.log((log).cyan);
}, function(error) {
    console.log(("Error optimizing CSS: " + error).red);
});
