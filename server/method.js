Meteor.methods({
	/**
	 * Creates a new Room in the database with the specified attributes.
	 *
	 * @param room The room to be created
	 */
	'insertRoom': function(room) {
		Rooms.insert({
			name: room.name,
			//dim: room.dim,
			//points: room.points,
			created_at: new Date(),
		});
	},

	/**
	 * Creates a new data Point in the database with the specified attributes.
	 *
	 * @param room_name The name of the room to attach the point to
	 * @param point The point to be created, as a json object
	 */
	'insertData': function(room_name, point) {
		// create some identification data
		d = new Date();
		date_key = "" + d.getFullYear() + d.getMonth() + d.getDate();
		key = "x" + point.x + "y" + point.y;
	
		// insert the data into the database
		Points.insert({
			"room" : room_name,
			"year" : d.getFullYear(),
			"month" : d.getMonth(),
			"day" : d.getDate(),
			"x" : point.x,
			"y" : point.y,
    		"temp" : point.temp,
    		"rad_temp" : point.radtemp,
    		"humidity" : point.humid,
    		"velocity" : point.velocity
		});

//		// check if this date already has an entry in room_name
//		// otherwise, add it
//		Rooms.update({
//			name: room_name, date_key: { $exists: false }}
//		}, {
//			$set : {
//				date_key
//		// add the point data
//		Rooms.update(name: room_name, {
//			$set: {
//				date_key.key: entry
//			}
//		});
//
//		date = {};
//    	date[key] = {};
//    	date.key["temp"] = point.temp;
//    	date.key["rad_temp"] = point.radtemp;
//    	date.key["humidity"] = point.humid;
//    	date.key["velocity"] = point.velocity;
//		
//		Rooms.update(name: room_name, {
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
		Points.remove({});
		Rooms.remove({});
	}
});
