require.config({
	paths: {
		'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
		'tweet': 'vendor/jquery-twitter-display/tweet/jquery.tweet',
		'socket.io': '/socket.io/socket.io',
		'modernizer': 'vendor/modernizr-2.6.2-respond-1.1.0.min',
		'config': '../config',
		'bootstrap': 'vendor/bootstrap.min',
		'ui': '//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min',
		'growl': '/js/vendor/bootstrap-growl/jquery.bootstrap-growl',
		'mousewheel': '/js/vendor/jquery-mousewheel/jquery.mousewheel',
		'infinite': '/js/vendor/jquery-infinite-drag/javascripts/jquery.infinitedrag'
	}
});

require([
	'jquery', 'config', 'viewport', 'user', 'card', 'util/notification', 
	    'board/connection', 'analytics', 'board/infinite-drag', 'board', 'modernizer'], 
	function($, config, viewport, user, card, notification) {
	
	setTimeout(function() {
		if (user.hasSetName == true)
			return;
		notification.add('Hey! Did you know you can set your name ' 
		    + 'by clicking "set name" in the settings ' 
		    + 'menu, or <a href="#" class="open-set-name-modal">click here... quick!</a>', 'success', {
			'delay' : 15000
		});
	}, 8000);
	
	/*
	 * $('.viewport-container > div').css('transform-origin', '0px 0px');
	   $('.viewport-container').bind('mousewheel', function(event, delta) {
        //viewport.scale = viewport.scale + (delta / 50);
        //if (viewport.scale < 0.02) viewport.scale = 0.02;
        //scaleViewport();
	});
	*/
});