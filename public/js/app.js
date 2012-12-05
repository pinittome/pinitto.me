$(document).ready(function() {

	var socket = io.connect('//' + window.document.location.host);
	var zIndex = 100;
	var user   = {
		id : '',
		name : ''
	};
	var viewport = {
		scale: 1,
		offset: { x: $('.viewport-container').offset().left, y: $('.viewport-container').offset().top },
	};
	
	var hasSetName = false;

	setTimeout(function() {
		if (hasSetName == true)
			return;
		addNotification('Hey! Did you know you can set your name ' 
		    + 'by clicking "set name" in the settings ' 
		    + 'menu, or <a href="#" class="open-set-name-modal">click here... quick!</a>', 'success', {
			'delay' : 15000
		});
	}, 8000);

	bringToFront = function(event, element) {
		if (this.constructor.name == 'HTMLDivElement') {
			element = this;
		}
		if ($(element).css('z-index') != zIndex) {
			$(element).css('z-index', ++zIndex);
			socket.emit('card.zIndex', {
				cardId : $(element).attr('id'),
				zIndex : $(element).css('z-index')
			});
		}
	}
	socket.on('card.zIndex', function(data) {
		$('#' + data.cardId).css('z-index', data.zIndex);
	});
	saveCardPosition = function(event, ui) {
		var position = { 
			x: $(this).css('left').substring(0, $(this).css('left').length - 2),
			y: $(this).css('top').substring(0, $(this).css('top').length - 2)
		};
		socket.emit('card.moved', {
			cardId : $(this).attr('id'),
			position : position			
		});
	}
	updateCardPosition = function(event, ui) {
		var position = { 
			x: $(this).css('left').substring(0, $(this).css('left').length - 2),
			y: $(this).css('top').substring(0, $(this).css('top').length - 2)
		};
		socket.emit('card.moving', {
			cardId : $(this).attr('id'),
			position : position
		});
	}
	setCardPosition = function(id, position) {
		element = $('#' + id);
		x = position.x; 
		y = position.y; 
		element.css('top', y + 'px').css('left', x + 'px').css('position', 'absolute');
	}
	addNotification = function(message, messageType, override) {
		options = {
			ele : 'body',
			type : messageType, // 'info', 'error', 'info'
			offset : {
				from : 'bottom',
				amount : 10
			},
			align : 'right',
			width : 250,
			delay : 4000,
			allow_dismiss : true,
			stackup_spacing : 10
		};
		$.extend(options, override);
		$.bootstrapGrowl(message, options);
	}

	socket.on('card.moving', function(data) {
		setCardPosition(data.cardId, data.position);
	});

	socket.on('connect', function(data) {
		socket.emit('board.join', boardId);
		user.id = socket.socket.sessionid;
	});
	
	socket.on('connect_failed', function(reason) {
		console.log("Not authorised to see this board. Redirect to login.");
		//document.location.href = "/login/" + boardId;
	});

	$("div#leave").click(function() {
		socket.emit('board.leave');
		$(this).remove();
	});

	$("div.viewport-container").click(function(e) {
		lastClick = e;
		socket.emit('card.create', {
			position : {
				x : e.pageX,
				y : e.pageY
			}
		});
	});

	socket.on('card.list', function(data) {
		data.forEach(function(d) {
			if ($('#' + d._id)) {
				$('#' + d._id).remove();
			}
			d.cardId = d._id;
			createCard(d);
		});
	});
	socket.on('user.list', function(data) {
		addToUserList(data);
	});

	socket.on('card.created', function(data) {
		createCard(data);
	});

	createCard = function(data) {
        if (data.zIndex) {
        	stackOrder = data.zIndex;
        	if (data.zIndex >= zIndex) {
        		zIndex = parseInt(data.zIndex) + 1;
        	}
        } else {
        	stackOrder = zIndex++;
        	socket.emit('card.zIndex', {cardId: data.cardId, zIndex: stackOrder});
        }
		div = document.createElement('div');
		
		card = $(div).attr('class', 'card draggable')
		    .attr('id', data.cardId)
		    .css('z-index', stackOrder)
		    .css('width', data.size.width + 'px')
		    .css('height', data.size.height + 'px')
		    .appendTo(".viewport");
		if (data.cssClass) {
			card.addClass('card-' + data.cssClass);
		} else {
			card.addClass('card-yellow');
		}
		
		controls = document.createElement('div');
		$(controls).attr('class', 'controls');
		$(controls).append(''
			+ '<i class="icon-resize-full card-resize" title="Resize card">&nbsp;</i>'
			+ '&nbsp;&nbsp;<i class="icon-remove card-delete" title="Delete card">&nbsp;</i> '
		    + '<i class="icon-eye-open card-colour" title="Change card colour">&nbsp;</i> '
			+ '<i class="icon-move card-move">&nbsp;</i> '
			+ '<i>drag to move...</i>'
		);
		$(controls).appendTo($(div));

		textarea = document.createElement('textarea');
		$(textarea).appendTo($(div));

		card.draggable({
			cursor : "move",
			/*cursorAt : { top: 0, left: 0 },*/
			keyboard : true,
			containment : "parent",
			delay : 0,
			opacity : 0.65,
			start : bringToFront,
			stop : saveCardPosition,
			drag : updateCardPosition,
			/*handle: ".card-move",*/
			scroll: true
		});
		if (data.size) {
			$(card).width(data.size.width).height(data.size.height);
		}
		if (data.content) {
			$(card).find('textarea').val(data.content);
		}
				
		setCardPosition(data.cardId, data.position);
		$(card).resizable({
			handles: 'se',
			stop: function(event, ui) {
				socket.emit('card.resize', {
					cardId : $(this).attr('id'),
					size : {
						width : ui.size.width,
						height : ui.size.height
					}
				});
			}
	    });
	}

	$('body').on('click', '.open-set-name-modal', function() {
		$('#set-name-modal').modal({
			backdrop : true
		});
	});
	$('#close-set-name-modal').click(function() {
		$('#set-name-modal').modal('hide');
	});
	$('#update-name').click(function() {
		name = $('#set-name-modal').find('input').val();
		socket.emit('user.name.set', {
			name : name
		});
		$('#set-name-modal').modal('hide');
	});
	socket.on('user.name.set', function(data) {
		var oldName;
		hasSetName = true;
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
		    addNotification('"' + oldName + '" has changed their name to "' + data.name + '"', 'info');
		}
	});
	socket.on('user.join', function(data) {
		addToUserList(data);
		addNotification('User "' + data.name + '" has joined the board', 'info');
	});
	socket.on('user.leave', function(data) {
		$('.userlist').find('li').each(function(index, element) {
			if ($(element).attr('id') == "user-" + data.userId) {
				addNotification('User "' + $(element).find('span').text() + '" has left', 'info');
				$(element).remove();
				updateUserCount()
				return;
			}
		});
	});
		
	socket.on('card.resize', function(data) {	
        $('#' + data.cardId).animate({
            width: data.size.width,
            height: data.size.height
        });
	});
	$('.viewport').on('click', '.card-delete', function(event) {
		socket.emit('card.delete', { cardId: $(this).parents('.card').attr('id') });
		event.stopPropagation();
	});
	socket.on('card.delete', function(data) {
		$('#' + data.cardId).remove();
		addNotification(data.name + " deleted a card", 'info');
	});
	$('.viewport').on('click', '.card-colour', function(event){
		card = $(this).parents('.card');
		cssClass = determineCssClasses(card);
		card.removeClass();
		card.addClass('card').addClass('card-' + cssClass);
		socket.emit(
			'card.colour',
			{ cardId: card.attr('id'), cssClass: cssClass}
		);
		event.stopPropagation();
	});
	socket.on('card.colour', function(data){
		$('#' + data.cardId).removeClass().addClass('card').addClass('card-' + data.cssClass);
	});
    $('.viewport').on('input propertychange', '.card textarea', function(event) {
    	socket.emit('card.text-change', {cardId: $(this).parent().attr('id'), content: $(this).val()});
    });
    socket.on('card.text-change', function(data) {
    	$('#' + data.cardId).find('textarea').val(data.content);
    });
	$('.viewport').on('click', '.card', function(event) {
		bringToFront(event, $(this));
		event.stopPropagation();
	});
 
	determineCssClasses = function(card) {
		validCssClasses = [ 'yellow', 'green', 'red', 'blue', 'white']
		for (var index = 0; index < validCssClasses.length; index++) {
			if (card.is('.card-' + validCssClasses[index])) {
				if (index == validCssClasses.length - 1) {
					index = -1;
				}
				return validCssClasses[index+1];
			}
		}
		return validCssClasses[0];	 	
	}
	
	addToUserList = function(data) {
		isUser = (user.id == data.userId) ? ' (me)' : '';
		newUser = document.createElement('li');
		$(newUser).attr('id', 'user-' + data.userId).append('<a href="#"><i class="icon-user"></i> <span>' + data.name + '</span>' + isUser + '</a>');
		$('.userlist').append(newUser);
		updateUserCount();
	}
	// Hijack scrolling
	scroll = function() {
		console.log('Scrolling', $(this));
	}
	resizeViewport = function() {
		console.log("Resizing viewport");
		$('.viewport-container').css('width', window.width);
		$('.viewport-container').css('height', window.innerHeight - 43);
	}
	window.addEventListener('scroll', scroll, false);
	window.addEventListener('resize', resizeViewport, false);
	resizeViewport();

	updateUserCount = function() {
		$('.usercount').html($('.userlist').find('li').size());
	};
	
	
	$('.leave').click(function() {
		document.location.href = '/';
	});
	
	$('.viewport-container > div').css('transform-origin', '0px 0px');

	$('.viewport-container').bind('mousewheel', function(event, delta) {
		var x = (window.innerWidth / 2);
        var y = (window.innerHeight / 2);
        viewport.scale = viewport.scale + (delta / 50);

	    $('.viewport-container').children().each(function() {
	    	if (viewport.scale <= 0) return;
	    	$(this).css(
	    		'transform-origin',
	    		$('.viewport-container').offset().left + 'px ' 
	    		    + $('.viewport-container').offset().top + 'px'
	    	);
	    	$(this).css(
	    		'transform',
	    		'scale(' + viewport.scale + ')'
	    	);
	    	$(this).css(
	    		'transform-origin', x + 'px ' + y + 'px'
	    	);
	    });
	});

}); 