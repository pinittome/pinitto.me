var massahHelper = require('massah/helper')
  , helper = massahHelper.application.helper

/**
    When I open the board title modal
    And I change the board title to 'This is my board'
    And I click the 'Save board' button
    Then the board title is updated
 */
module.exports = (function() {
    var library = massahHelper.getLibrary()
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
