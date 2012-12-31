define(['jquery', 'socket', 'util/notification', 'viewport'], function($, socket, notification, viewport) { 
	
    
    Board.prototype.setName = function(name) {
    	this.socket.emit('board.name.set', { name : name });
    }
    Board.prototype.zIndex = 100;
    function Board(socket) { this.socket = socket; }
    
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
	socket.on('board.name.set', function(data) {
		var oldName;
		$('.board-name').each(function(index, element) {
			$(element).html(data.name);
			$(element).attr('title', data.name);
		});
		notification.add('The board name has been changed to "' + data.name + '"');
	});
	$("div.viewport-container").click(function(e) {
		lastClick = e;
		var x = e.pageX - parseFloat($('.viewport').css('left').replace('px', ''));		
		var y = e.pageY - viewport.header.height - parseFloat($('.viewport').css('top').replace('px', ''));
		socket.emit('card.create', {
			position : {
				x : x,
				y : y
			}
		});
	});

	$('.leave').click(function() {
		document.location.href = '/logout';
	});
	
    return board;
});
