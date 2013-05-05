define(['jquery', 'socket', 'util/notification', 'viewport', 'user', 'util/grid-size'],
    function($, socket, notification, viewport, user, gridCalc) { 

    Board.prototype.setName = function(name) {
        this.socket.emit('board.name.set', { name : name })
    }
    Board.prototype.zIndex = 100
    Board.prototype.setAccess = function(access) {
        this.socket.emit('board.access.set', access)
    }
    Board.prototype.setCard = function(card) {
    	this.card = card
    }
    Board.prototype.setSizeGrid = function(size) {
    	this.card.setSizeGrid(size)
    }
    Board.prototype.setPositionGrid = function(size) {
    	this.card.setPositionGrid(size)
    }
    function Board(socket) {
        this.socket = socket
        this.preventCardCreation = false
    }
    
    board = new Board(socket)
    
    $('body').on('click', '.open-set-board-name-modal', function() {
        $('#set-board-name-modal').modal({
            backdrop : true
        })
    })
    $('#close-set-board-name-modal').click(function() {
        $('#set-board-name-modal').modal('hide')
    })
    $('#update-board-name').click(function() {
        name = $('#set-board-name-modal').find('input').val()
        board.setName(name)
        $('#set-board-name-modal').modal('hide')
    })
    
    $('body').on('click', '.open-board-access-modal', function() {
        $('#board-access-modal').modal({
            backdrop : true
        })
    })
    $('#close-board-access-modal').click(function() {
        $('#board-access-modal').modal('hide')
    });
    ['admin', 'write', 'read'].forEach(function(level) {
        $('input[name=password-admin-require]').click(function() {
            if ($(this).attr('checked')) return $('input[name=password-'+level+'-value]').removeAttr('disabled');
            $('input[name=password-'+level+'-value]').attr('disabled', 'disabled')
        
        })
    })

    $('.update-board-access').click(function() {

        var error  = $(document.createElement('div'));
        var button = $(document.createElement('button'))
        error.attr('class', 'alert alert-error');
        button.attr('class', 'close').attr('data-dismiss', 'alert').html('&times;')
        button.appendTo(error)

        $('#board-access-modal .modal-body .error').remove()
        var access = {}
        ['admin','write','read'].forEach(function(level) {
            access[level] = { 
                require: Boolean($('input[name=password-'+level+'-require]').attr('checked')),
                password: $('#board-access-modal').find('input[name=password-'+level+'-value]').val()
            }
               
            if (access.admin.require && access.admin.password.length == 0) {
                $(document.createElement('div'))
                    .html('<strong>Whoa!</strong> Password is *required*, yet you\'ve left it blank!')
                    .appendTo(error)
                $('#board-access-modal .modal-body').prepend(error)
                return
            }
        })
        board.setAccess(access)
        $('#board-access-modal').modal('hide')
    })

    socket.on('board.access.set', function(data) {
        if (data.userId != user.id) {
            notification.add($('#user-' + data.userId).find('span').text() + " updated board access details", 'info')
        } else {
            notification.add("Board access details successfully updated!", "success")
        }
    })
    
    $('body').on('click', '.open-board-grid-modal', function() {
        $('#board-grid-modal').modal({
            backdrop : true
        })
        $('#board-grid-modal select.grid-position').val(boardConfig.grid.position || 'none')
        $('#board-grid-modal select.grid-size').val(boardConfig.grid.size || 'none')
        $('#board-grid-modal input.grid-confirm').attr('checked', false)
    })
    $('#close-board-grid-modal').click(function() {
        $('#board-grid-modal').modal('hide')
    })
    $('#update-board-grid').on('click', function() {
    	$('#board-grid-modal .modal-body .error').remove()
    	var error  = $(document.createElement('div'))
        var button = $(document.createElement('button'))
        error.attr('class', 'alert alert-error')        
        button.attr('class', 'close').attr('data-dismiss', 'alert').html('&times;')
        button.appendTo(error)
        if (0 == $('.grid-confirm:checked').length) {
            var message = '<strong>Hang on a minute...</strong><br/>'
                + 'Please check the confirmation below in order to continue'
            $(document.createElement('div')).html(message).appendTo(error)
            $('#board-grid-modal .modal-body').prepend(error)
            return
        }
        var getValue = function(element) {
            if (['none', 'small', 'medium', 'large'].indexOf(element.val()) == -1) return 'none'
            return element.val()
        }
        var position = getValue($('.grid-position'))
        var size     = getValue($('.grid-size'))

        if (!boardConfig.grid) boardConfig.grid = { position: 'none', size: 'none'}

        if (boardConfig.grid.position != position) {
            socket.emit('board.grid.position', position)
            if ('none' != size) {
	            socket.once('board.grid.position', function(size) {
	            	var grid = gridCalc.position(position)
	            	$('.card').each(function(index, c) {
	            		var top = Math.ceil($(c).css('top').replace('px', '') / grid[1]) * grid[1]
	            		var left = Math.ceil($(c).css('left').replace('px', '') / grid[0]) * grid[0]
	            		$(c).css('top', top)
	            		$(c).css('left', left)
	            	    board.card.savePosition.call($(c))
	            	})
	            })
	        }
        }
        if (boardConfig.grid.size != size) {
            socket.emit('board.grid.size', size)
            if ('none' != size) {
	            var grid = gridCalc.size(size)
	            socket.once('board.grid.size', function(size) {
	            	$('.card').each(function(index, c) {
	            		var width = Math.ceil($(c).css('width').replace('px', '') / grid) * grid;
	            		var height = Math.ceil($(c).css('height').replace('px', '') / grid) * grid;
	            		$(c).css('width', width);
	            		$(c).css('height', height);
	            		board.card.resized.call(
	            	    	$(c),
	            	    	'mouseup', { size: { width: width, height: height } }
	            	    );
	            	});
	            });
	        }
        }
        $('#board-grid-modal').modal('hide');
    });
    
    socket.on('board.name.set', function(data) {
        var oldName;
        $('.board-name').each(function(index, element) {
            $(element).html(data.name);
            $(element).attr('title', data.name);
        });
        notification.add('The board name has been changed to "' + data.name + '"');
    });
    socket.on('board.grid.postion', function(data) {
        board.setPositionGrid(data.size);
    });
    socket.on('board.grid.size', function(data) {
    	board.setSizeGrid(data.size);
    })
    $('.leave').click(function() {
        document.location.href = '/logout';
    });
    
    return board;
});
