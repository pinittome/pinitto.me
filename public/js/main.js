$(document).ready(function() {
	var socket = io.connect('http://localhost/public');

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
});


