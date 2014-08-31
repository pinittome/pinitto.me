var helper = require('massah/helper')

module.exports = (function() {
    var library = helper.getLibrary()
        .when('I enter the password \'(.*)\'', function(password) {
            this.driver.input('div.board-password input').enter(password)
        })
        .then('I see the authentication elements', function(page) {
            var params = this.params
            this.driver.content('Board ID', 'label')
            this.driver.content('Password', 'label')
            this.driver.element('div.board-id div').text(function(text) {
                text.should.include(params.boardId)
            })
            this.driver.element('div.board-password div input[type="password"]')
            this.driver.content('Get me some access...', 'button')
            this.driver.element('button.leave').text(function(text) {
                text.should.equal('Cancel')
            })
        })
    
    return library
})()