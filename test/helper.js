var port = 3000

var getLibrary = function(dictionary) {
    var library = new Yadda.localisation.English.library(dictionary)
    return library
}

var application = null

var beforeSuite = function(done) {
    options = {
       debug: false,
       silent: ('development' === process.env.NODE_ENV) ? false : true,
       site: 'http://localhost:' + port
   }
   application = require('../index')

   application.httpServer.server.listen(port, function() {
      done()
   })
}

var afterSuite = function(done) {
    application.httpServer.server.close()
    done()
}

var beforeScenario = function(annotations, context) {}

module.exports = {
    beforeSuite: beforeSuite,
    afterSuite: afterSuite,
    beforeScenario: beforeScenario,
    port: port
}
