define(['site/create'], function() {
    var lastAdminPassword = ''
    $('#create-board input[name=password-admin]').bind('change keyup input', function() {
        var writePassword = $('#create-board input[name=password-write]')
        var readPassword  = $('#create-board input[name=password-read]')
        if ((0 == writePassword.val().length) || (writePassword.val() == lastAdminPassword)) 
            writePassword.val(this.value)
        if ((0 == readPassword.val().length) || (readPassword.val() == lastAdminPassword))
        readPassword.val(this.value)
        lastAdminPassword = this.value
    })
})
