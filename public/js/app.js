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
        'growl': 'vendor/bootstrap-growl/jquery.bootstrap-growl',
        'mousewheel': 'vendor/jquery-mousewheel/jquery.mousewheel',
        'infinite': 'vendor/jquery-infinite-drag/javascripts/jquery.infinitedrag'
    },
    shim: {
        'growl': {
            deps: ['jquery', 'ui']
        },
        'infinite': {
            deps: ['jquery', 'ui']
        },
        'bootstrap': {
            deps: ['jquery', 'ui']
        },
        'ui': {
            deps: ['jquery']
        },
        'socket': {
            deps: ['socket.io']
        }
    }
});

require([
    'jquery', 'viewport', 'user', 'card', 'util/notification', 'socket', 'board',
        'board/connection', 'analytics', 'board/infinite-drag', 'modernizer'], 
    function($, viewport, user, card, notification, socket, board) {
    
    $('.card').each(function() {
        if ($(this).css('z-index') > board.zIndex) board.zIndex = $(this).css('z-index')
        card.dynamify($(this).attr('id'));
        card.addControls($(this).attr('id'))
    });
    
    setTimeout(function() {
        if (user.hasSetName == true) return;
        notification.add('Hey! Did you know you can set your name ' 
            + 'by clicking "set name" in the settings ' 
            + 'menu, or <a href="#" class="open-set-name-modal">click here... quick!</a>', 'success', {
            'delay' : 15000
        });
    }, 8000);
    
    socket.on('error', function(data) {
        notification.add('ERROR: ' + data.message, 'error')
    });

    if (window.location.hash) card.scrollTo(window.location.hash.replace('#', ''));

    /*
     * $('.viewport-container > div').css('transform-origin', '0px 0px');
       $('.viewport-container').bind('mousewheel', function(event, delta) {
        //viewport.scale = viewport.scale + (delta / 50);
        //if (viewport.scale < 0.02) viewport.scale = 0.02;
        //scaleViewport();
    });
    */
});