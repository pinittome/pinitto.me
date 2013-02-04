require.config({
    paths: {
    	'requireLib': 'require',
        'jquery': 'vendor/jquery-1.8.3.min',
        'tweet': 'vendor/jquery-twitter-display/tweet/jquery.tweet',
        'socket.io': '/socket.io/socket.io',
        'modernizer': 'vendor/modernizr-2.6.2-respond-1.1.0.min',
        'config': '../config',
        'bootstrap': 'vendor/bootstrap.min',
        'ui': 'vendor/jquery-ui-1.10.0.min',
    },
    shim: {
        'bootstrap': {
            deps: ['jquery', 'ui']
        },
        'ui': {
            deps: ['jquery']
        }
    }
});

require(['jquery', 'socket', 'analytics', 'totals', 'tweet', 'bootstrap', 'modernizer', 'ui'], function($, socket) {

    socket.on('connect', function(data) {
        socket.emit('statistics.join');
    });
    
    if (typeof(values) != 'undefined') {
        for (key in values) $('input[name=' + key + ']').val(values[key]);
    }
    if (typeof(errors) != 'undefined') {
        for (var i = 0; i < errors.length; i++) {
            error = errors[i];
            var input = $('input[name=' + error.param + ']');
            input.val(error.value);
            input.parents('div.control-group').addClass('error');
            input.after('<span class="help-inline">' + error.msg + '</span>');
        };
    }
    if (typeof(config.twitter) != 'undefined' && config.twitter) {
        $(".tweet").tweet({
            join_text: "auto",
            username: config.twitter,
            avatar_size: 32,
            count: 3,
            loading_text: "Loading tweets..."
        });
    }
});