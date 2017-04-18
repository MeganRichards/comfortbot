Meteor.methods({
	/**
	 * Creates a new Room in the database with the specified attributes.
	 *
	 * @param room The room to be created
	 */
	'insertRoom': function(room) {
		if (Rooms.find({name: room.name}).count == 0) {
			Rooms.insert({
				name: room.name,
				x: room.x,
				y: room.y,
				years: [],
				created_at: new Date(),
			});
		}
	},

	/**
	 * Updates the data of the currently loaded room.
	 * This data is then used to find the correct points
	 * to draw on the screen.
	 *
	 * @param map JSON data of the map
	 */
	'updateLoadedMap': function(map) {
		if (LoadedMap.find().count() != 0) {
			LoadedMap.remove({});
		}

		LoadedMap.insert({
			room: map.room,
			day: map.day,
			month: map.month,
			year: map.year,
			created_at: new Date(),
		});
	},

	/**
	 * Gets the most recent map created to be the default display
	 * on the page, given some room
	 * 
	 */
	 'setLatestMap': function() {
	 	var map = Points.findOne({}, {sort: {year: -1, limit: 1}});
	    // Meteor.call('updateLoadedMap', data);

	    if (LoadedMap.find().count() != 0) {
			LoadedMap.remove({});
		}

		LoadedMap.insert({
			room: map.room,
			day: map.day,
			month: map.month,
			year: map.year,
			created_at: new Date(),
		});
	 },

	'insertTest': function() {
		room_name = "BBW280";
		console.log("CALLING insertTest");
		d = new Date();
		// update Rooms to include this year, if not already included
		Rooms.update({name: room_name}, {
			$push: {
				years: d.getFullYear()
			}
		});
//
//		if (!Rooms[room_name].years.includes(d.getFullYear())) {
//			Rooms.update(name: room_name, {
//				$push: {
//					years: d.getFullYear()
//				}
//			});
//		}
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

		console.log("running function " + Points.find({room: room_name, x: point.x, y: point.y, year: d.getFullYear(), month: d.getMonth(), day: d.getDate()}).count());


		// if point already exists, delete it and replace with this new data
		if (Points.find({room: room_name, x: point.x, y: point.y, year: d.getFullYear(), month: d.getMonth(), day: d.getDate()}).count() >= 1) {
			console.log("removed old point");
			Points.remove({room: room_name, x: point.x, y: point.y, year: d.getFullYear(), month: d.getMonth(), day: d.getDate()});
		}

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

		// update Rooms to include this year, if not already included
		Rooms.update({name: room_name}, {
			$addToSet: {
				years: d.getFullYear()
			}
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
