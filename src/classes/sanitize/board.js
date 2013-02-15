var validator = require('validator');

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

BoardSanitize.prototype.size = function(data) {
	var size = 'none';
	switch (data) {
		case 'large':
		case 'medium':
		case 'small':
		    size = data;
	}
	return size;
}

var BoardSanitizer = new BoardSanitize(validator)
module.exports = BoardSanitizer