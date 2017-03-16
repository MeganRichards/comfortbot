import { Meteor } from 'meteor/meteor';

Meteor.startup(function () {
	if (Circles.find().count() === 0) {
  		Circles.insert({data: [5, 8, 11, 14, 17, 20]});
	}
});

Meteor.setInterval(function () {
	var newData = _.shuffle(Circles.findOne().data);
	Circles.update({}, {data: newData});
}, 2000);