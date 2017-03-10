Meteor.methods({
	/**
	 * Creates a new Room in the database with the specified attributes.
	 *
	 * @param room The room to be created
	 */
	'insertRoom': function(room) {
		Room.insert({
			name: room.name,
			dim: room.dim,
			points: room.points
			created_at: new Date(),
		});
	},
	
	/**
	 * Creates a new Map in the database with the specified attributes.
	 *
	 * @param map The map to be created
	 */
	'insertMap': function(map) {
		Maps.insert({
			loc: map.loc,
			temp: map.temp,
			rad_temp: map.radtemp,
			humidity: map.humid,
			velocity: map.velocity
		});
	},

	/**
	 * Deletes all the data maps in the database.
	 *
	 */
	'deleteMaps': function() {
		Maps.remove({});
	}
});
