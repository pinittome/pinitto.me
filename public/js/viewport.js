define(['jquery'], function($) {
    
    resizeViewport = function() {
        console.log("Resizing viewport");
        $('.viewport-container').css('width', window.width);
        $('.viewport-container').css('height', window.innerHeight - 43);
        $('body').css('background-position', (0.5 * window.width) + 'px ' + (0.5 * window.innerHeight) + 'px');
        $('#card-list').find('ul').css('max-height', window.innerHeight * 0.66);
        var height = (document.height < window.innerHeight) ? 
            document.height : window.innerHeight
        document.body.style.height = (height - 43) + 'px'
    }
    window.addEventListener('resize', resizeViewport, false);
    resizeViewport();
    
    return {
        scale: 1,
        offset: { x: $('.viewport-container').offset().left, y: $('.viewport-container').offset().top },
        background: { width: 1024, height: 768 },
        header: { height: 43 },
        size: { width: window.innerWidth, height: window.innerHeight }
    }
});
