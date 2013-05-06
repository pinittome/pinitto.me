var access = {
    ADMIN: 'admin',
    WRITE: 'write',
    READ:  'read',
    NONE:  'none'
}

exports.ADMIN = access.ADMIN
exports.WRITE = access.WRITE
exports.READ  = access.READ
exports.NONE  = access.NONE

exports.levels = [ access.ADMIN, access.WRITE, access.READ ]

exports.getLevel = function(board, password) {
    switch (true) {
        case (typeof(board.access) == 'undefined'):
        case (typeof(board.access.admin) != 'undefined' && board.access.admin == password):
        case (typeof(board.access.admin) == 'undefined' && false === password):
            console.log("User has access level 'admin', due to no password")
            return access.ADMIN
        case (typeof(board.access.write) != 'undefined' && board.access.write == password):
        case (typeof(board.access.write) == 'undefined' && false === password):
            console.log("User has access level 'write'")
            return access.WRITE
        case (typeof(board.access.read) != 'undefined' && board.access.read == password):
        case (typeof(board.access.read) == 'undefined' && false === password):
            console.log("User has access level 'read'")
            return access.READ
    }
    console.log("User has access level '" + access.NONE + "'")
    return access.NONE
}
