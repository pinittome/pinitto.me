var massahHelper = require('massah/helper')
  , helper = massahHelper.application.helper

module.exports = (function() {
    var library = massahHelper.getLibrary()
        .then('the user has the access level (.*)', function(level) {
            var driver = this.driver

            driver.element('a[title="Settings"]').click()
            driver.wait(function() {
                return driver.element('a.change-access-level').isDisplayed(function(displayed) {
                    if (!displayed) return false
                    driver.element('a.change-access-level').html(function(label) {
                        label.should.equal(
                            'Change access <p class="ui-li-aside">' +
                                level + '</p>'
                        )
                    })
                    return true
                })
            }, 5000, 'Waiting for access level label')
        })
    
    return library
})()
