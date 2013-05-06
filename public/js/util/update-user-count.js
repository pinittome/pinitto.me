define(['jquery'], function($) {
    return function() { $('.usercount').html($('.userlist').find('li').size()); }
});
