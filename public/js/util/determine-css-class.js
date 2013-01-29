define(function() {
    return function(card) {
        validCssClasses = [ 'yellow', 'green', 'red', 'blue', 'white']
        for (var index = 0; index < validCssClasses.length; index++) {
            if (card.is('.card-' + validCssClasses[index])) {
                if (index == validCssClasses.length - 1) {
                    index = -1;
                }
                return validCssClasses[index+1];
            }
        }
        return validCssClasses[0];         
    }
});