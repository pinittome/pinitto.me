require.config({
    paths: {
    	'requireLib': 'require',
        'jquery': 'vendor/jquery-1.11.1.min',
        'jquery-mobile': 'vendor/jquery.mobile-1.4.4.min',
        'tweet': 'vendor/jquery-twitter-display/tweet/jquery.tweet',
        'socket.io': '/socket.io/socket.io',
        'modernizer': 'vendor/modernizr-2.6.2-respond-1.1.0.min',
        'config': '../config',
        'bootstrap': 'vendor/bootstrap',
        'ui': 'vendor/jquery-ui-1.10.0.min'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery', 'ui']
        },
        'ui': {
            deps: ['jquery']
        },
        'jquery-mobile': {
            deps: ['jquery']
        },
        'jquery': {
            exports: '$'
        }
    }
})

require(['jquery', 'socket', 'analytics', 'totals', 'tweet', 'bootstrap', 'modernizer', 'ui', 'site/create'],
    function($, socket) {

    $(document).ready(function() {
        
        $(document).on("mobileinit", function () {
            $.extend($.mobile, {
                linkBindingEnabled: false,
                ajaxEnabled: false
            })
        })
        
        var addErrors = function(element, errors) {
            for (var i = 0; i < errors.length; i++) {
                var error = errors[i]
                if (error.mainMessage) {
                    var errorMessage = $(document.createElement('div'))
                        .attr('class', 'alert alert-error')
                        .append("<button type=\"button\" class=\"close\" "
                            + "data-dismiss=\"alert\">&times;</button><strong>Error</strong> "
                            + error.mainMessage
                        )
                    element.after(errorMessage)
                } else {
                        var input = $('input[name=' + error.param + ']')
                        input.val(error.value)
                        input.parents('div.control-group').addClass('error')
                        input.after('<span class="help-inline">' + error.msg + '</span>')
                    }
            }
        }


        socket.on('connect', function(data) {
            socket.emit('statistics.join');
        })

        if (typeof(values) != 'undefined') {
            for (key in values) $('input[name=' + key + ']').val(values[key])
        }
        if (typeof(errors.create) != 'undefined') {
            addErrors($('form#create-board h2.main'), errors.create)
        }
        if (typeof(errors.login) != 'undefined') {
            addErrors($('form#login-form legend'), errors.login)
        }
        $("#tabs").tabs()
        $('.open-tab').click(function(event) {
          var tab = $(this).attr('href')
          var index = 0
          switch (tab) {
            case '/#main': 
            default:
                index = 0
                break
            case '/#create':
                index = 1
                break
            case '/#login':
                index = 2
                break
          }
          return $('#tabs').tabs('option', 'active', index)
        })
        $('.manual').click(function(e) {
            document.location.href = $(this).attr('href')
            e.preventDefault()
        })
    })
})