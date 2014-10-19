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
            var selector = 'a[href="#set-board-name-modal"]'
            driver.element('a[title="Settings"]').click()
            driver.wait(function() {
                return driver.element(selector).isDisplayed(function(displayed) {
                    return displayed
                })
            }, 5000, 'Waiting for settings panel to open')
            driver.element('a[href="#set-board-name-modal"]').click()
        })
        .when('I change the board title to \'(.*)\'', function(title) {
            var driver = this.driver
            var params = this.params
            var selector = 'div#set-board-name-modal input[type=text]'
            driver.wait(function() {
                return driver.element(selector).isDisplayed(function(displayed) {
                    if (false === displayed) return false
                    driver.input(selector).enter(title)
                    params.boardTitle = title
                    return true
                })
            }, 5000, 'Waiting for board title form')
        })
        .then('the board title is (.*)updated', function(not) {
            var params = this.params
            this.driver.element('h4.board-name').html(function(title) {
                if (not) {
                    title.should.not.equal(params.boardTitle)
                } else {
                    title.should.equal(params.boardTitle)
                }
            })
        })
    
    return library
})()
