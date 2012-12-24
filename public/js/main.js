require.config({
	paths: {
		'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
		'tweet': 'vendor/jquery-twitter-display/tweet/jquery.tweet',
		'socket.io': '/socket.io/socket.io',
		'modernizer': 'vendor/modernizr-2.6.2-respond-1.1.0.min',
		'config': '../config',
		'bootstrap': 'vendor/bootstrap.min'
	}
});

require(['jquery', 'config', 'analytics', 'totals', 'tweet', 'bootstrap'], function($, config) {

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
	        avatar_size: 48,
	        count: 4,
	        loading_text: "Loading tweets..."
	    });
	}
});