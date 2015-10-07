var database = null

var setDb = function(db) {
	database = db
}

module.exports = {
	setDb: setDb,
	connection: function() {
		return database
	}
}