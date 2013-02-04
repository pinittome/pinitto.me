var requirejs = require('requirejs');

var applicationConfig = {
    baseUrl: './public/js',
    name: 'app',
    out: './public/app.js',
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
    out: './public/main.js',
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
	console.log((log).cyan);
}, function(error) {
    console.log(("Error optimizing javascript: " + error).red);
});

requirejs.optimize(mainConfig, function (log) {
	console.log("Main javascript optimisation complete".green);
	console.log((log).cyan);
}, function(err) {
    console.log(("Error optimizing javascript: " + err).red);
});