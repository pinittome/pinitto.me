var access = require('../access')
  , utils  = require('../util')

Acl = function(socket) {
    this.socket = socket
    this.currentLevel = access.NONE
}

Acl.prototype.setCurrentLevel = function(level) {
    this.currentLevel = level
}

Acl.prototype.hasPermission = function(required) {
    var allowed = false
    switch (required) {
        case access.ADMIN:
            if (access.ADMIN == this.currentLevel) allowed = true
            break
        case access.WRITE:
            if (utils.inArray(this.currentLevel, [ access.ADMIN, access.WRITE ])) allowed = true
            break
        case access.READ:
            if (utils.inArray(this.currentLevel, [ access.ADMIN, access.WRITE, access.READ ])) allowed = true
            break
        case access.NONE:
            allowed = true
            break
    }
    if (false == allowed) {
        this.socket.emit('error', {
          message: 'You do not have permission to perform this action' 
        })
    }
    return allowed        
}

module.exports = Acl
