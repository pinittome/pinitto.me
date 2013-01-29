define(['socket'], function(socket) {
    socket.on('totals', function(data) {
        if ($('.totals-cards')) {
            $('.totals-cards').html(data.cards);
        }
        if ($('.totals-boards')) {
            $('.totals-boards').html(data.boards);
        }
        if ($('.totals-sockets')) {
            $('.totals-sockets').html(data.sockets);
        }
    });
})
