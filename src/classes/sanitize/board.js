var validator = require('validator');
validator.error = function(message) {
    throw Error(message)
}

BoardSanitize = function(validator) {
    this.sanitize = validator.sanitize
    this.check    = validator.check	
}

BoardSanitize.prototype.rename = function(data) {
	data.name = this.sanitize(data.name).entityEncode()
	data.name = this.sanitize(data.name).xss()
	return data
}

BoardSanitize.prototype.checkBoardId = function(id) {
	this.check(id).regex(/[a-z0-9\/]/i).notEmpty()	
}


var BoardSanitizer = new BoardSanitize(validator)
module.exports = BoardSanitizer