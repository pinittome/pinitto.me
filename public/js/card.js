define(['jquery', 'socket', 'util/determine-css-class', 'board', 'util/notification', 'board/infinite-drag', 'user'], 
    function($, socket, determineCssClass, board, notification, infiniteDrag, user) {
	
	Card.prototype.bringToFront = function(event, element) {

		if (element.helper) element = element.helper
		if ($(element).css('z-index') != this.board.zIndex) {
			$(element).css('z-index', ++this.board.zIndex);
			socket.emit('card.zIndex', {
				cardId : $(element).attr('id'),
				zIndex : $(element).css('z-index')
			});
		}
		event.stopPropagation();
	}

	Card.prototype.savePosition = function(event, ui) {
		var position = { 
			x: $(this).css('left').substring(0, $(this).css('left').length - 2),
			y: $(this).css('top').substring(0, $(this).css('top').length - 2)
		};
		socket.emit('card.moved', {
			cardId : $(this).attr('id'),
			position : position			
		});
		event.stopPropagation();
	}
	Card.prototype.updatePosition = function(event, ui) {
		var position = { 
			x: $(this).css('left').substring(0, $(this).css('left').length - 2),
			y: $(this).css('top').substring(0, $(this).css('top').length - 2)
		};
		socket.emit('card.moving', {
			cardId : $(this).attr('id'),
			position : position
		});
		event.stopPropagation();
	}
	Card.prototype.setPosition = function(id, position) {
		element = $('#' + id);
		x = position.x; 
		y = position.y; 
		element.css('top', y + 'px').css('left', x + 'px').css('position', 'absolute');
	}
	
	Card.prototype.scrollTo = function(id) {
        var viewport = $('.viewport');
        var element = $('#' + id);
        if (element.length == 0) return;
        newOffsetX = (window.innerWidth / 2) 
            - (parseFloat(viewport.css('left').replace('px', '')) + parseFloat(element.css('left').replace('px', '')))
            - (parseFloat(element.css('width').replace('px', '')) / 2);
        newOffsetY = (window.innerHeight / 2) 
            - (parseFloat(viewport.css('top').replace('px', '')) + parseFloat(element.css('top').replace('px', '')))
            - (parseFloat(element.css('height').replace('px', '')) / 2);
        self = this;
        counter = 0;
        viewport.animate({
	            top: parseFloat(viewport.css('top').replace('px', '')) + newOffsetY,
	            left: parseFloat(viewport.css('left').replace('px', '')) + newOffsetX,
	        }, 
	        {
	        	step: function() {
	        		if (counter > 20) {
		        		$(window).resize();
		            	var evt = document.createEvent('UIEvents');
						evt.initUIEvent('resize', true, true, window, 1);
						window.dispatchEvent(evt);
						counter = 0;
					} else {
						counter++;
					}
	        	},
	        	complete: function() {
	        	    $(window).resize();
	            	var evt = document.createEvent('UIEvents');
					evt.initUIEvent('resize', true, true, window, 1);
					window.dispatchEvent(evt);
				}
	        },
	        300);
        
    }
    
	Card.prototype.create = function(data) {
        if (data.zIndex) {
        	stackOrder = data.zIndex;
        	if (data.zIndex >= this.board.zIndex) {
        		this.board.zIndex = parseInt(data.zIndex) + 1;
        	}
        } else {
        	stackOrder = this.board.zIndex++;
        	socket.emit('card.zIndex', {cardId: data.cardId, zIndex: stackOrder});
        }
		this.draw(data)		
	    this.addCardListEntry(data)
	    this.dynamify(data.cardId)
	}
	Card.prototype.draw = function(data) {
		div     = document.createElement('div');        
		card    = $(div).attr('class', 'card draggable')
		    .attr('id', data.cardId)
		    .attr('draggable', 'true')
		    .css('z-index', stackOrder)
		    .css('width', data.size.width + 'px')
		    .css('height', data.size.height + 'px')
		    .appendTo(".viewport");
		css = 'card-yellow';
		if (data.cssClass) {
			css = 'card-' + data.cssClass;
		}
			    
		card.addClass(css);
		
		anchor = document.createElement('a');
		$(anchor).attr('name', data.cardId);
		$(anchor).appendTo($(div));

		textarea = document.createElement('textarea');
		$(textarea).appendTo($(div));
		$(textarea).css('width', parseFloat(data.size.width - 10))
		    .css('height', parseFloat(data.size.height - 10));
        var self = this
		
		if (data.size) {
			$(card).width(data.size.width).height(data.size.height);
		}
		if (data.content) {
			$(card).find('textarea').val(data.content);
		}	
		this.addControls(data.cardId);
		this.setPosition(data.cardId, data.position);
	}
	Card.prototype.dynamify = function(id) {
		var self = this;
		$('#' + id).draggable({
			cursor : "move",
			keyboard : true,
			delay : 0,
		    opacity : 0.65,
		    create: function(event, ui) { event.stopPropagation(); }, 
			start : function(event, element) {
				self.bringToFront(event, element);
			},
			stop : this.savePosition,
			drag : this.updatePosition,
			scroll: true,
			iframeFix: true
		});
		$('#' + id).resizable({
			minHeight: 15,
			minWidth: 15,
			handles: 'se',
			resize: function(event, ui) {
				$(this).find('textarea').css('width', parseFloat($(this).css('width')) - 10)
		            .css('height', parseFloat($(this).css('height'))- 10);
			},
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
	Card.prototype.addControls = function(id) {
		controls = document.createElement('div');
		$(controls).attr('class', 'controls');
		$(controls).append(''
			+ '<i class="icon-resize-full card-resize" title="Resize card">&nbsp;</i>'
			+ '&nbsp;&nbsp;<i class="icon-remove card-delete" title="Delete card">&nbsp;</i> '
		    + '<i class="icon-eye-open card-colour" title="Change card colour">&nbsp;</i> '
			+ '<i class="icon-move card-move">&nbsp;</i> '
			+ '<i>drag to move...</i>')
		
		$(controls).appendTo($("#" + id));
	}
	Card.prototype.addCardListEntry = function(data) {
		content = "<i>No content</i>";
		if (data.content && data.content != '') {
			content = data.content.substring(0, 30) + '...';
		}
		cardListEntry = $(document.createElement('li'));
		cardListEntry.attr('id', 'entry-' + data.cardId);
		cardListEntry.addClass(css);
		cardListEntry.append('<a href="#' + data.cardId + '" onclick="return false;">' + content + '</a>');
		$('.card-list').find('li.no-cards').addClass('hidden');
	    ul = $('.card-list').find('ul');
	    cardListEntry.appendTo($(ul));
	}
	function Card(socket, infinite, board) {
		this.socket = socket;
		this.infinite = infinite;
		this.board = board;
	}
	
	var cardEntity = new Card(socket, infiniteDrag, board);
	
	
	socket.on('card.zIndex', function(data) {
		$('#' + data.cardId).css('z-index', data.zIndex);
		board.zIndex = data.zIndex;
	});
	socket.on('card.moving', function(data) {
		cardEntity.setPosition(data.cardId, data.position);
	});
	socket.on('card.list', function(data) {
		data.forEach(function(d) {
			if ($('#' + d._id).length == 0) {
				d.cardId = d._id;
				cardEntity.create(d);
			}
		});
	});
	socket.on('card.created', function(data) {
		cardEntity.create(data);
	});
	socket.on('card.resize', function(data) {
		$('#' + data.cardId).find('textarea').animate({
        	width: parseFloat(data.size.width - 10) + 'px',
		    height: parseFloat(data.size.height - 10) + 'px'
		});	
        $('#' + data.cardId).animate({
            width: data.size.width,
            height: data.size.height
        });
	});
	$('.viewport').on('click', '.card-delete', function(event) {
		socket.emit('card.delete', { cardId: $(this).parents('.card').attr('id') });
		$('ul.card-list').find('li.no-cards').removeClass('hidden');
		event.stopPropagation();
	});
	socket.on('card.delete', function(data) {
		$('#' + data.cardId).remove();
		$('#entry-' + data.cardId).remove();
        if ($('li.card-list ul li').length < 2) $('.no-cards').removeClass('hidden')
        if (data.userId != user.id) notification.add(data.name + " deleted a card", 'info');
	});
	$('.viewport').on('click', '.card-colour', function(event){
		card = $(this).parents('.card');
		cardListEntry = $('li.card-list').find('#entry-' + card.attr('id'));
		
		cssClass = determineCssClass(card);
		card.removeClass();
		cardListEntry.removeClass();
		card.addClass('card').addClass('card-' + cssClass);
		cardListEntry.addClass('card-' + cssClass);
		socket.emit(
			'card.colour',
			{ cardId: card.attr('id'), cssClass: cssClass}
		);
		event.stopPropagation();
	});
	
	$('li.card-list').on('mouseover', 'li', function(event) {
	     $('#' + $(this).attr('id').replace('entry-', '')).addClass('highlight');	
	});
	$('li.card-list').on('mouseout', 'li', function(event) {
	     $('#' + $(this).attr('id').replace('entry-', '')).removeClass('highlight');	
	});
	$('li.card-list').on('click', 'li', function(event) {
	     cardEntity.scrollTo($(this).attr('id').replace('entry-', ''));
	});
	
	socket.on('card.colour', function(data){
		$('#' + data.cardId).removeClass().addClass('card').addClass('card-' + data.cssClass);
		$('#entry-' + data.cardId).removeClass().addClass('card-' + data.cssClass);
	});
    $('.viewport').on('input propertychange', '.card textarea', function(event) {
    	socket.emit('card.text-change', {cardId: $(this).parent().attr('id'), content: $(this).val()});
        content = $(this).val();
        if (content.length == 0) {
            content = '<i>No content</i>';
        } else {
            content = content.substring(0, 30) + '...';
        }
        $('#entry-' + $(this).parent().attr('id')).find('a').html(content);
    });
    socket.on('card.text-change', function(data) {
    	$('#' + data.cardId).find('textarea').val(data.content);
        if (data.content.length == 0) {
            data.content = "<i>No content</i>";
        } else { 
            data.content = data.content.substring(0, 30) + '...';
        }
        $('#entry-' + data.cardId).find('a').html(data.content);
    });
	$('.viewport-container').on('click', '.card', function(event) {
		cardEntity.bringToFront(event, $(this));
		event.stopPropagation();
	});

    return cardEntity;
});
