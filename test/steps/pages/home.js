var helper = require('massah/helper')

module.exports = (function() {
    var library = helper.getLibrary()
        .then('I expect to see the home page elements', function(page) {
            this.driver.element('a[href="/#create"] button')
            this.driver.element('div#tabs li a[href="#main"]')
            this.driver.element('div#tabs li a[href="#create"]')
            this.driver.element('div#tabs li a[href="#login"]')
            this.driver.element('div#tabs li a[href="http://go.pinitto.me/manual"]').then(
                function() {},
                function() { throw new Error('Missing home page elements') }
            )
        })
    
    return library
})()