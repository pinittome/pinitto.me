var helper = require('massah/helper')

module.exports = (function() {
    var library = helper.getLibrary()
        .then('the user has the access level (.*)', function(level) {
            var driver = this.driver
            driver.wait(function() {
                return driver.element('div.modal-backdrop').then(
                    function() { return false },
                    function() { return true }
                )
            }, 15000, 'Waiting for connection modal to close')
            
            driver.element('a[title="Settings"]').click()
            this.driver.element('a.change-access-level').text(function(label) {
                label.should.equal(
                    'Change access level (' + level + ')'
                )
            })
        })
    
    return library
})()