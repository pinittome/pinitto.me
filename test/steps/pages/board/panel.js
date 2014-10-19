var massahHelper = require('massah/helper')
  , helper = massahHelper.application.helper

module.exports = (function() {
    var library = massahHelper.getLibrary()
        .when('I open the \'(.*)\' panel', function(panel) {
            var driver = this.driver
            this.driver.element('div.ui-panel-dismiss-open').then(
                function() { driver.element('div.ui-panel-dismiss-open').click() },
                function() {}
            )
            driver.element('a[title="' + panel + '"]').click()
            var id = panel.replace(' ', '-').toLowerCase()
            driver.wait(function() {
                return driver.element('#' + id).isDisplayed(function(visible) {
                    return visible
                })
            }, 2000, 'Waiting for panel to open')
                
        })
    
    return library
})()
