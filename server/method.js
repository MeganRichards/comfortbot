Meteor.methods({
	/**
	 * Creates a new Room in the database with the specified attributes.
	 *
	 * @param room The room to be created
	 */
	'insertRoom': function(room) {
		Rooms.insert({
			name: room.name,
			dim: room.dim,
			points: room.points,
			created_at: new Date(),
		});
	},

	/**
	 * Creates a new Map in the database with the specified attributes.
	 *
	 * @param room The room to be created
	 */
	'insertMap': function(map) {
		Maps.insert({
			name: map.name,
			dim: map.dim,
			points: map.points,
			created_at: new Date(),
		});
	},
	
	/**
	 * Creates a new data Point in the database with the specified attributes.
	 *
	 * @param point The point to be created
	 */
	'insertData': function(point) {
		Points.insert({
			loc: point.loc,
			temp: point.temp,
			rad_temp: point.radtemp,
			humidity: point.humid,
			velocity: point.velocity
		});
	},

	/**
	 * Deletes all the data points in the database.
	 *
	 */
	'deleteData': function() {
		Points.remove({});
	}
});
