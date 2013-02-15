var validator = require('validator');

CardSanitize = function(validator) {
    this.sanitizer = validator.sanitize
    this.check = validator.check    
}

CardSanitize.prototype.move = function(data) {
    this.checkCardId(data.cardId)
    this.check(data.position.x, 'Illegal card position sent').isDecimal()
    this.check(data.position.y, 'Illegal card position sent').isDecimal()
    return data
}

CardSanitize.prototype.resize = function(data) {
    this.checkCardId(data.cardId)    
    this.check(data.size.width, 'Illegal card size sent').isDecimal().min(5)
    this.check(data.size.height, 'Illegal card size sent').isDecimal().min(5)
    return data
}

CardSanitize.prototype.create = function(data) {
	this.check(data.position.x, 'Illegal card position provided').isDecimal();
	this.check(data.position.y, 'Illegal card position provided').isDecimal();
    return data
}

CardSanitize.prototype.changeColour = function(data) {
    this.checkCardId(data.cardId)
    data.cssClass = this.sanitizer(data.cssClass).trim()
    this.check(data.cssClass, ' ').isAlpha().notEmpty()
    return data
}

CardSanitize.prototype.content = function(data) {
    this.checkCardId(data.cardId)
    data.content = this.sanitizer(data.content).entityEncode()
    data.content = this.sanitizer(data.content).xss()
    return data
}

CardSanitize.prototype.stackOrder = function(data) {
    this.checkCardId(data.cardId)
    this.check(data.zIndex).isInt().min(100)
    return data
}

CardSanitize.prototype.checkCardId = function(id) {
    this.check(id).isAlphanumeric().notEmpty()    
}

var cardSanitizer = new CardSanitize(validator)
module.exports = cardSanitizer
