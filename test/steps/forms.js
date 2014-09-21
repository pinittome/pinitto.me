var helper = require('massah/helper')

module.exports = (function() {
    var library = helper.getLibrary()
        .given('I enter \'(.*)\' in the \'(.*)\' field', function(value, field) {
            this.driver.input('*[name="' + field + '"]').clear()
            this.driver.input('*[name="' + field + '"]').enter(value)
            if (!this.params.fields) this.params.fields = {}
            this.params.fields[field] = value
        })
        .then('the \'(.*)\' field has error \'(.*)\'', function(field, error) {
            var driver = this.driver
            var selector = 'div.error div span.help-inline'
            driver.wait(function() {
                return driver.element(selector).text(function(text) {
                    if (text.trim() !== error.trim()) return false
                    driver.element('div.error input[name="' + field + '"]').then(
                         function() {},
                        function() { throw new Error('Expected error field') }
                    )
                    return true
                })
            }, 10000, 'Waiting for error')
        })
    
    return library
})()
