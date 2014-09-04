var helper = require('massah/helper')

module.exports = (function() {
    var library = helper.getLibrary()
        .then('an (.*) notification of \'(.*)\' should be seen', function(type, message) {
            var selector = 'div.bootstrap-growl.alert-' + type
            var driver = this.driver
            driver.wait(function() {
                return driver.element(selector).then(
                    function() {
                        return true
                    },
                    function() { return false }
                )
            }, 15000, 'Waiting for notification')
            this.driver.element(selector).text(function(text) {
                text.should.include(message)
            })
        })
    
    return library
})()
