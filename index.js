require('colors')

environment = process.env.NODE_ENV || 'production';

   ["",
    " Welcome to...".green,
    "       ___  _         _  __   __".red,                     
    "      / _ \\(_) ___   (_)/ /_ / /_ ___      __ _  ___".red, 
    "     / ___// // _ \\ / // __// __// _ \\ _  /  ' \\/ -_)".red,
    "    /_/   /_//_//_//_/ \\__/ \\__/ \\___/(_)/_/_/_/\\__/".red, 
    "                                                     ".red,
    "The open source, infinte-scrolling, realtime virtual corkboard".green,
    "",
    " Created by: ".cyan,
    "    - Lloyd Watkin (@lloydwatkin)".cyan,
    "    - Jonny Heavey (@jonnyheavey".cyan,
    "",
    "    www.pinitto.me ::: github.com/pinittome ::: @pinittome".green,
    ""].forEach(function(data) { console.log(data)})


config = require('./config.' + environment + '.js');
config.cookie.key = 'connect.sid';
if (!config.app.useOptimised) {
    config.app.useOptimised = ('development' == environment) ? false : true; 
}

require('./src/build');
httpServer = require('./src/server');
require('./src/io');
