define(['jquery', 'ui', 'infinite'], function($) {
    return $.infinitedrag(".viewport", {}, {
        width: window.innerHeight,
        height: window.innerWidth,
        class_name: 'viewport-background',
        oncreate: function($element, col, row) { $element.text(''); },
        start_col: 0,
        start_row: 0
    });
});
