var helper = require('massah/helper')

var checkIdentifier = function(context) {
    var driver = context.driver
    var find = new RegExp('[^0-9a-z]', 'ig')
    var slug = context.params.fields['slug'].replace(find, '-').toLowerCase()
    var regex = new RegExp('\/n\/' + slug)
    driver.wait(function() {
        return driver.currentUrl(function(url, currentUrl) {
            return currentUrl.path.match(regex)
        })
    }, 5000, 'Waiting for a new board with the URL identifier')
}

module.exports = (function() {
    var library = helper.getLibrary()
        .given('I create a board with identifier \'(.*)\'', function(identifier) {
            var driver = this.driver
            driver.get('http:/localhost:3000/#create')
            driver.input('*[name="owner"]').enter('user@example.com')
            driver.input('*[name="slug"]').enter(identifier)
            if (!this.params.fields) this.params.fields = {}
            this.params.fields.slug = identifier
            driver.button('Create board').click()
            checkIdentifier(this)
        })
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
        .then('the new board has the expected title', function() {
            var expected = this.params.fields['board-name']
            var selector = 'div.navbar a.board-name'
            this.driver.element(selector).text(function(title) {
                title.should.equal(expected)
            })
        })
        .then('I am redirected to the identified board', function() {
            checkIdentifier(this)
        })
    
    return library
})()
