define(function() {
    return {
        position: function(size) {
            var grid = null;
            switch (size) {
	    		case 'large':
	    		    grid = [100, 100];
	    		    break;
	    		case 'medium':
	    		    grid = [50, 50];
	    		    break;
	    		case 'small':
	    		    grid = [25, 25];
	    		    break;
            }
            return grid;
        },
        size: function(position) {
            var grid = null;
            switch (position) {
	    		case 'large':
	    		    grid = 150;
	    		    break;
	    		case 'medium':
	    		    grid = 75;
	    		    break;
	    		case 'small':
	    		    grid = 25;
	    		    break;
            }
            return grid;
        }
    };
}); 