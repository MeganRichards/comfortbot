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
	 * Creates a new data Point in the database with the specified attributes.
	 *
	 * @param room_name The name of the room to attach the point to
	 * @param point The point to be created
	 */
	'insertData': function(room_name, point) {
		d = new Date();
		date_key = "" + d.getFullYear() + d.getMonth() + d.getDate();
		key = "x" + point.x + "y" + point.y;
		
		entry = {
    		"temp" : point.temp,
    		"rad_temp" : point.radtemp,
    		"humidity" : point.humid,
    		"velocity" : point.velocity
		};

//		date = {};
//    	date[key] = {};
//    	date.key["temp"] = point.temp;
//    	date.key["rad_temp"] = point.radtemp;
//    	date.key["humidity"] = point.humid;
//    	date.key["velocity"] = point.velocity;
//		
//		Rooms.upsert(name: room_name, {
//			$push: {
//				date_key.key: entry
//			}
//		});
	},

	/**
	 * Deletes all the rooms in the database.
	 *
	 */
	'deleteData': function() {
		Rooms.remove({});
	}
});
