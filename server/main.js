import { Meteor } from 'meteor/meteor';

Meteor.startup(function () {
  var date = new Date();
  var map = {
    room: "BBW280",
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate()
  };
  // call delayed
  var t = setTimeout(Meteor.call('updateLoadedMap', map), 5000);

  if (Circles.find().count() === 0) {
    Circles.insert({data: [5, 8, 11, 14, 17, 20]});
  }
});

Meteor.setInterval(function () {
  // var date = new Date();
  // var map = {
  //   room: "BBW280",
  //   year: date.getFullYear(),
  //   month: date.getMonth(),
  //   day: date.getDate()
  // };
  // Meteor.call('updateLoadedMap', map);	
	var newData = _.shuffle(Circles.findOne().data);
	Circles.update({}, {data: newData});
}, 2000);