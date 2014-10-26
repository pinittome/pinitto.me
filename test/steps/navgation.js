var massahHelper = require('massah/helper')
  , helper = massahHelper.application.helper

module.exports = (function() {
    var library = massahHelper.getLibrary()
        .given('I navigate to the (.*) page', function(page) {
            switch (page) {
                case 'home':
                    this.driver.get(helper.baseUrl + '/')
                    break
                case 'create board':
                    this.driver.get(helper.baseUrl + '/#create')
                    break
                default:
                    throw new Error('Unknown page \'' + page + '\'')
            }
        })
        .when('I click the \'(.*)\' button', function(label) {
            var driver = this.driver
            driver.wait(function() {
                return driver.button(label).isDisplayed(function(visible) {
                    if (!visible) return false
                    driver.button(label).click()
                    return true
                })
            }, 3000, 'Waiting for button to appear')
        })
        .when('I click the \'(.*)\' link', function(linkText) {
            this.driver.link(linkText).click()
        })
        .when('I click element \'(.*)\'', function(selector) {
            this.driver.element(selector).click()  
        })
        .when('I visit the board', function() {
            this.driver.get(helper.baseUrl + '/' + this.params.boardId)  
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
        .then('I am redirected to the authentication screen', function() {
            var driver = this.driver
            driver.wait(function() {
                return driver.currentUrl(function(url, currentUrl) {
                    return currentUrl.path.match(/\/?id=[a-z0-9]{24}.*/)
                })
            }, 5000, 'Waiting for the authentication screen')
        })
        .then('I am redirected to a new board', function() {
            var driver = this.driver
            driver.wait(function() {
                return driver.currentUrl(function(url, currentUrl) {
                    return currentUrl.path.match(/\/[a-z0-9]{24}.*/)
                })
            }, 5000, 'Waiting for a new board')
        })
        .then('I am redirected to the board', function() {
            var driver = this.driver
            driver.wait(function() {
                return driver.currentUrl(function(url, currentUrl) {
                    return currentUrl.path.match(/\/[a-z0-9]{24}.*/)
                })
            }, 5000, 'Waiting for board access')
        })
    
    return library
})()
