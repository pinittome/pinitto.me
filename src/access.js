
access = {
    ADMIN: 'ADMIN',
    WRITE: 'WRITE',
    READ:  'READ',
    NONE:  'NONE'
}

exports.ADMIN = access.ADMIN;
exports.WRITE = access.WRITE;
exports.READ  = access.READ;
exports.NONE  = access.NONE;

exports.getLevel = function(board, password) {
    if (typeof(board.access) == 'undefined') {
        console.log("User has access level 'admin', due to no password");
        return access.ADMIN;
    } else if ((typeof(board.access.admin) != 'undefined') && (board.access.admin == password)) {
        console.log("User has access level 'admin'");
        return access.ADMIN;
    } else if ((typeof(board.access.write) != 'undefined') 
        && (board.access.write == password)) {
        console.log("User has access level 'write'");
        return access.WRITE;            
    } else if (typeof(board.access.read) != 'undefined' 
        && (board.access.read == password)) {
        console.log("User has access level 'read'");
        return access.READ;            
    } else if ((typeof(board.access.admin) == 'undefined') 
        && (typeof(board.access.write) == 'undefined')
        && (typeof(board.access.read) == 'undefined')) {
        console.log("User has access level 'admin', due to no board password");
        return access.ADMIN;
    }
    return access.NONE;            
}
