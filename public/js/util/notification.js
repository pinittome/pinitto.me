define(['jquery', 'ui', 'growl'], function() {
    
    function Notification() {};
    
    Notification.prototype.add = function(message, messageType, override) {
        options = {
            ele : 'body',
            type : messageType, // 'info', 'error', 'info'
            offset : {
                from : 'bottom',
                amount : 10
            },
            align : 'right',
            width : 250,
            delay : 4000,
            allow_dismiss : true,
            stackup_spacing : 10
        };
        $.extend(options, override);
        $.bootstrapGrowl(message, options);
    }
    return new Notification();
});