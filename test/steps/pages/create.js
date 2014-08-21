var helper = require('massah/helper')

module.exports = (function() {
    var library = helper.getLibrary()
        .then('I expect to see the create board page elements', function(page) {
            this.driver.element('input[type="email"][name="owner"]')
            this.driver.element('input[name="board-name"]')
            this.driver.element('input[type="password"][name="password-admin"]')
            this.driver.element('input[type="password"][name="password-write"]')
            this.driver.element('input[type="password"][name="password-read"]')
            this.driver.element('select[name="grid-size"]')
            this.driver.element('select[name="grid-position"]')
            this.driver.button('Cancel')
            this.driver.button('Create board').then(
                function() {},
                function(error) {
                    throw new Error('Missing home page elements', error)
                }
            )
        })
    
    return library
})()
