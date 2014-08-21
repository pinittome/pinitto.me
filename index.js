require('colors')
var readJson = require('read-package-json')
environment  = process.env.NODE_ENV || 'production'

   var helloWorld = ["",
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
    "    - Jonny Heavey (@jonnyheavey)".cyan,
    "",
    "    www.pinitto.me ::: github.com/pinittome ::: @pinittome".green,
    ""].join('\n')

console.log(helloWorld)

var data = require('./package.json')
config = require('./src/config')(data)
require('./src/build')
httpServer = require('./src/server')
require('./src/io')
if (process.mainModule === module) {
    httpServer.listen(config.server.port)
} else {
    exports.httpServer = httpServer
}