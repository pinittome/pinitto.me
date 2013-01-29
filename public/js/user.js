define(['jquery', 'socket', 'util/notification', 'util/update-user-count', 'bootstrap'], function($, socket, notification, userCount) {
        
    function User(name, localStorage, socket) {
        this.name = name;
        this.localStorage = localStorage;
        this.socket = socket;
    };
    User.prototype.localStorage = null;
    User.prototype.id  = '';
    User.prototype.name = null;
    User.prototype.hasSetName = false;
    User.prototype.setName = function(name) {
        this.name = name;
        this.localStorage.setItem('user.name', name);
    }
    User.prototype.addToList = function(data) {
        isUser = (user.id == data.userId) ? ' (me)' : '';
        newUser = document.createElement('li');
        $(newUser).attr('id', 'user-' + data.userId).append(
            '<a href="#"><i class="icon-user"></i> <span>' 
                + data.name + '</span>' + isUser + '</a>'
        );
        $('.userlist').append(newUser);
        userCount.call();
    }

    user = new User(localStorage.getItem('user.name'), localStorage, socket);
    
    socket.on('user.join', function(data) {
        user.addToList(data);
        notification.add('User "' + data.name + '" has joined the board', 'info');
    });
    socket.on('user.leave', function(data) {
        $('.userlist').find('li').each(function(index, element) {
            if ($(element).attr('id') == "user-" + data.userId) {
                notification.add('User "' + $(element).find('span').text() + '" has left', 'info');
                $(element).remove();
                userCount.call()
                return;
            }
        });
    });
    socket.on('user.list', function(data) {
        user.addToList(data);
    });
        $('body').on('click', '.open-set-name-modal', function() {
        $('#set-name-modal').modal({
            backdrop : true
        });
    });
    $('#close-set-name-modal').click(function() {
        $('#set-name-modal').modal('hide');
    });
    $('#set-name-modal .update-name').click(function() {
        name = $('#set-name-modal').find('input').val();
        // Put user's name into storage
        user.setName(name);
                socket.emit('user.name.set', {
            name : name
        });
        $('#set-name-modal').modal('hide');
    });
    socket.on('user.name.set', function(data) {
        var oldName;
        user.hasSetName = true;
        $('.userlist').find('li').each(function(index, element) {
            if ($(element).attr('id') == "user-" + data.userId) {
                oldName = $(element).find('span').text();
                $(element).find('span').html(data.name);
            }
        });
        if (data.userId == user.id) {
            $('.myname').each(function(index, element) {
                $(element).html(data.name);
            });
        } else {
            notification.add('"' + oldName + '" has changed their name to "' + data.name + '"', 'info');
        }
    });
    
    
    return user;
});
