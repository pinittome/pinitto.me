var massahHelper = require('massah/helper')
  , helper = massahHelper.application.helper

module.exports = (function() {
    var library = massahHelper.getLibrary()
        .when('I change the board title to \'(.*)\'', function(title) {
            var driver = this.driver
            var params = this.params
            driver.wait(function() {
                return driver.element('div.modal-backdrop').then(
                    function() { return false },
                    function() { return true }
                )
            }, 15000, 'Waiting for connection modal to close')

            driver.element('a[title="Settings"]').click()
            driver.element('a.open-set-board-name-modal').click()
            driver.wait(function() {
                return driver.element('input.name-set').then(
                    function() {
                        driver.element('input.name-set').enter(title)
                        driver.element('#update-board-name').click()
                        params.boardTitle = title
                        return true 
                    },
                    function() { return false }
                )
            }, 5000, 'Waiting for name modal to open')
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
