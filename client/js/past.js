import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import '../past.html';

Template.past.onCreated(function pastOnCreated() {
  // current date to be displayed
  this.room = new ReactiveVar("BBW280");
  this.year = new ReactiveVar((new Date()).getFullYear());
  this.month = new ReactiveVar((new Date()).getMonth());
  this.day= new ReactiveVar((new Date()).getDate());
});

// TODO: separate into it's own file
Template.past.helpers({
  // gets name of all rooms in Rooms collection
  all_room_names() {
  	return Rooms.find();
  },
  date_string(date) {
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	  month = date[0] + date[1];
	  day = date[2] + date[3];
	  return "" + months[parseInt(month)] + " " + day;
  },
  // return all unique month/days in the year
  day(room_name, year) {
	return _.uniq(Points.find({room: room_name, year: year}, {
		sort: {day: 1, month: 1}, fields: {day: true, month: true}
		}).fetch().map(function(x) {
			return "" + ('0' + (x.month)).slice(-2) + ('0' + x.day).slice(-2);
			}), true);
  },
  // checks if tree node is the currently selected one
  // for highlighting purposes
  current_room(datestring) {
    current_node = Template.instance().month.get() + Template.instance().day.get();
    if (datestring == current_node) {
      return true;
    }
    return false;
  }
});

Template.past.events({
  'click .nav .green'(event, instance) {
    // TODO: highlight LoadedMap date.
  },
  /*
    not the best solution admittedly

    The more I write this function, the sadder I get

    The reason this is so bad is because it doesn't bind
    the behavior to the state of the object at all, I'm
    literally just manipulating ids and storing those values
    which means I'll always have to do all this bs just for a simple
    highlight.  If I binded the behavior to the state, i.e., created 
    a new collection that contains the one highlighted point, or added 
    a highlight field to each points object, then this would be better.
    but no, I have to store FOUR (4) variables just to keep track of a 
    highlighted element which I then have to mush together and somehow relate
    to the database anyway.  Man, how annoying and poorly written and I don't
    know why I'm just typing about it instead of changing it.  W/e
  */
  'click .tree-node'(event, instance) {
    var report = event.currentTarget.id;
    var datestring = report.split("-")[1];
    var classes = event.currentTarget.className;

    var m = "" + ('0' + instance.month.get()).slice(-2);
    var d = "" + ('0' + instance.day.get()).slice(-2);
    var current = parseInt(instance.year.get() + m + d);
    if (classes.split(" ").length == 1)  {
      // remove previous highlight and update new one
      // if there's an error with classList, it's because there's no data
      // from today
      var previous = document.getElementById(instance.room.get() + "-" + current);
      if (previous != null) {
        previous.classList.remove("selected");
      }

      // highlight current node
      event.currentTarget.className += " selected";

      // update reactive vars
      var new_room = event.currentTarget.id.split("-")[0];
      instance.room.set(new_room);
      var new_date = event.currentTarget.id.split("-")[1];
      instance.year.set(parseInt(new_date.substring(0, 4)));
      instance.month.set(parseInt(new_date.substring(4, 6)));
      instance.day.set(parseInt(new_date.substring(6, 8)));
    }
  },
  'click .submit'(event, instance) {
    // re-render the d3js component using w/e
    // to re-render, you just need to change the 
    // LoadedMap db object.
    var map = {
      room: instance.room.get(),
      year: instance.year.get(),
      month: instance.month.get(),
      day: instance.day.get() 
    };
    Meteor.call('updateLoadedMap', map);
  },
});
