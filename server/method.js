Meteor.methods({
	/**
	 * Creates a new Room in the database with the specified attributes.
	 *
	 * @param room The room to be created
	 */
	'insertRoom': function(room) {
		Room.insert({
			name: post.name,
			dim: post.dim,
			points: post.points
			created_at: new Date(),
		});
	},
});
