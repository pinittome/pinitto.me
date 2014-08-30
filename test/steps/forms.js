var helper = require('massah/helper')

module.exports = (function() {
    var library = helper.getLibrary()
        .given('I enter \'(.*)\' in the \'(.*)\' field', function(value, field) {
            this.driver.input('*[name="' + field + '"]').enter(value)    
            if (!this.params.fields) this.params.fields = {}
            this.params.fields[field] = value
        })
        .then('the \'(.*)\' field has error \'(.*)\'', function(field, error) {
            var selector = 'div.error span.help-inline'
            this.driver.element(selector).text(function(text) {
                text.should.equal(error)
            })
            this.driver.element('div.error input[name="' + field + '"]').then(
                function() {},
                function() { throw new Error('Expected error field') }
            )
        })
    
    return library
})()
