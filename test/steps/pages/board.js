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
        .when('I open the board title modal', function() {
            var driver = this.driver
            driver.element('a[title="Settings"]').click()
            driver.element('a.open-set-board-name-modal').click()
            driver.wait(function() {
                return driver.element('input.name-set').then(
                    function() { return true },
                    function() { return false }
                )
            }, 5000, 'Waiting for name modal to open')
        })
        .when('I change the board title to \'(.*)\'', function(title) {
            var driver = this.driver
            var params = this.params
            driver.wait(function() {
                return driver.element('input.name-set').isDisplayed(function(displayed) {
                    return displayed
                })
            }, 5000, 'Waiting for board title form')
            driver.element('input.name-set').enter(title)
            params.boardTitle = title
        })
        .then('the board title is updated', function() {
            this.driver.element('a.board-name').html(function(title) {
                title.should.equal(this.params.boardTitle)
            })
        })
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
