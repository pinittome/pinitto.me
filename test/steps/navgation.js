var helper = require('massah/helper')

module.exports = (function() {
    var library = helper.getLibrary()
        .given('I navigate to the (.*) page', function(page) {
            switch (page) {
                case 'home':
                    this.driver.get('http://localhost:3000/')
                    break
                case 'create board':
                    this.driver.get('http:/localhost:3000/#create')
                    break
                default:
                    throw new Error('Unknown page \'' + page + '\'')
            }
        })
        .when('I click the \'(.*)\' button', function(label) {
            this.driver.button(label).click()
        })
        .then('I am sent to the (.*) page', function(page) {
            switch (page) {
                case 'create board':
                    this.driver.currentUrl(function(url, currentUrl) {
                        currentUrl.hash.should.equal('#create')
                    })
                    break
                default:
                    throw new Error('Unknown page \'' + page + '\'')
            }
        })
        .then('I am redirected to a new board', function() {
            var driver = this.driver
            driver.wait(function() {
                return driver.currentUrl(function(url, currentUrl) {
                    return currentUrl.path.match(/\/[a-z0-9]{24}.*/)
                })
            }, 5000, 'Waiting for a new board')
        })
    
    return library
})()
