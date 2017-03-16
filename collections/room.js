Rooms = new Mongo.Collection('rooms');
Points = new Mongo.Collection('points');
LoadedMap = new Mongo.Collection('loaded_map', {capped: true, size: 1});
Circles = new Meteor.Collection('circles');
