$(document).ready(function() {
	var socket = io.connect('//' + window.document.location.host);

	socket.on('totals', function(data) {
		if ($('.totals-cards')) {
			$('.totals-cards').html(data.cards);
		}
		if ($('.totals-boards')) {
			$('.totals-boards').html(data.boards);
		}
	});


    if (typeof(errors) != 'undefined') {
	    for (var i = 0; i < errors.length; i++) {
	    	console.log("Adding error for " + errors[i].param);
	    	error = errors[i];
	    	var input = $('input[name=' + error.param + ']');
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


