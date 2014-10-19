var helper = require('massah/helper')

module.exports = (function() {
    var library = helper.getLibrary()
        .define('I wait (.*) seconds?', function(time) {
            time = parseFloat(time) * 1000
            var driver = this.driver
            var endTime = new Date().getTime() + time
            driver.wait(function() {
                return new Date().getTime() > endTime
            }, endTime + 5000, 'Error with wait helper')
        })
        .define('I wait for animations to finish', function() {
            time = 300
            var driver = this.driver
            var endTime = new Date().getTime() + time
            driver.wait(function() {
                return new Date().getTime() > endTime
            }, endTime + 5000, 'Error with wait helper')
        })
        .define('I wait for the panel to close', function() {
             var driver = this.driver
             driver.wait(function() {
                 return driver.element('.ui-panel-dismiss').isDisplayed(function(visible) {
                     return !visible
                 })
             }, 3000, 'Waiting for panel to close')
        })
    
    return library
    
})()