define(['jquery', 'socket', 'util/notification', 'viewport', 'user'],
    function($, socket, notification, viewport, user) { 

    Board.prototype.setName = function(name) {
        this.socket.emit('board.name.set', { name : name });
    }
    Board.prototype.zIndex = 100;
    Board.prototype.setAccess = function(access) {
        this.socket.emit('board.access.set', access)
    }
    Board.prototype.setCard = function(card) {
    	this.card = card;
    }
    Board.prototype.setSizeGrid = function(size) {
    	this.card.setSizeGrid(size);
    }
    Board.prototype.sizePositionGrid = function(size) {
    	this.card.setPostionGrid(size);
    }
    function Board(socket) {
        this.socket = socket;
        this.preventCardCreation = false;
    }
    
    board = new Board(socket);
    
    $('body').on('click', '.open-set-board-name-modal', function() {
        $('#set-board-name-modal').modal({
            backdrop : true
        });
    });
    $('#close-set-board-name-modal').click(function() {
        $('#set-board-name-modal').modal('hide');
    });
    $('#update-board-name').click(function() {
        name = $('#set-board-name-modal').find('input').val();
        board.setName(name);

        $('#set-board-name-modal').modal('hide');
    });
    
    $('body').on('click', '.open-board-access-modal', function() {
        $('#board-access-modal').modal({
            backdrop : true
        });
    });
    $('#close-board-access-modal').click(function() {
        $('#board-access-modal').modal('hide');
    });
    $('input[name=password-admin-require]').click(function() {
        if ($(this).attr('checked')) return $('input[name=password-admin-value]').removeAttr('disabled');
        $('input[name=password-admin-value]').attr('disabled', 'disabled')
        
    })
    $('.update-board-access').click(function() {
        $('#board-access-modal .modal-body .error').remove();
        var access = {
            admin: {
                require: Boolean($('input[name=password-admin-require]').attr('checked')),
                password: $('#board-access-modal').find('input[name=password-admin-value]').val()
            },
            write: {
                require: false,
                password: null
            },
            read: { 
                require: false,
                password: null
            }
        }
        var error  = $(document.createElement('div'));
        var button = $(document.createElement('button'))
        error.attr('class', 'alert alert-error');            
        button.attr('class', 'close').attr('data-dismiss', 'alert').html('&times;')
        button.appendTo(error);
               
        if (access.admin.require && access.admin.password.length == 0) {
            $(document.createElement('div'))
                .html('<strong>Whoa!</strong> Password is *required*, yet you\'ve left it blank!')
                .appendTo(error)
            $('#board-access-modal .modal-body').prepend(error);
            return;
        }
        board.setAccess(access);
        $('#board-access-modal').modal('hide');
    });
    socket.on('board.access.set', function(data) {
        if (data.userId != user.id) {
            notification.add($('#user-' + data.userId).find('span').text() + " updated board access details", 'info');
        } else {
            notification.add("Board access details successfully updated!", "success");
        }
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
