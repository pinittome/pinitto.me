define(['jquery'], function($) {
    return function() {
        $('.usercount').html($('#user-list').find('li').size())
    }
});
