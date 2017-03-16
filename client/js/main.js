import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import '../main.html';

Template.map.onCreated(function helloOnCreated() {
  this.counter = new ReactiveVar(0);	// counter starts at zero
  this.room_name = new ReactiveVar("WHO CARES");

  // var date = new Date();
  // var map = {
  //   room: "BBW280",
  //   year: date.getFullYear(),
  //   month: date.getMonth(),
  //   day: date.getDate()
  // }
  // Meteor.call('updateLoadedMap', map);

  console.log("Updated map.");
});

Template.past.onCreated(function pastOnCreated() {
  // current date to be displayed
  this.room = new ReactiveVar("BBW280");
  this.year = new ReactiveVar((new Date()).getFullYear());
  this.month = new ReactiveVar((new Date()).getMonth());
  this.day= new ReactiveVar((new Date()).getDate());

  this.test = new ReactiveVar("FDSA");
  // currently highlighted date
  //this.selected_date = map.instance().room_name.get() + this.year + this.month + this.day;

  // this variable holds the json we'll manipulate for the tree menu
  this.room_points = new ReactiveVar(Points.find({room: this.room_name}));
});


Template.map.helpers({
  counter() {
	return Template.instance().counter.get();
  },
  room_name() {
	return Template.instance().room_name.get();
  },
});

// TODO: separate into it's own file
Template.past.helpers({
  get_test() {
    return Template.instance().test.get();
  },
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

Template.map.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
});

var get_id = function(name, year, month, day) {
  month = "" + ('0' + (month)).slice(-2);
  day = "" + ('0' + (day)).slice(-2);

  return name + "-" + year + month + day;
};

Template.past.events({
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
      var previous = document.getElementById(instance.room.get() + "-" + current);
      previous.classList.remove("selected");

      // highlight current node
      event.currentTarget.className += " selected";

      // update reactive vars
      var new_date = event.currentTarget.id.split("-")[1];
      instance.year.set(parseInt(new_date.substring(0, 4)));
      instance.month.set(parseInt(new_date.substring(4, 6)));
      instance.day.set(parseInt(new_date.substring(6, 8)));
    }
  },
  'click .submit'(event, instance) {
    // re-render the d3js component using w/e

  },
});

// -------------------- TESTS -----------------------
// Template.map.onRendered(function () {
//   var svg, width = 500, height = 75, x;

//   svg = d3.select('#chart').append('svg')
//     .attr('width', width)
//     .attr('height', height);

//   var drawCircles = function (update) {
//     var data = Circles.findOne().data;
//     var circles = svg.selectAll('circle').data(data);
//     if (!update) {
//       circles = circles.enter().append('circle')
//         .attr('cx', function (d, i) { return x(i); })
//         .attr('cy', height / 2);
//     } else {
//       circles = circles.transition().duration(1000);
//     }
//     circles.attr('r', function (d) { return d; });
//   }; 

//   Circles.find().observe({
//     added: function () {
//       x = d3.scale.ordinal()
//         .domain(d3.range(Circles.findOne().data.length))
//         .rangePoints([0, width], 1);
//       drawCircles(false);
//     },
//     changed: _.partial(drawCircles, true)
//   });
// }); 
// ----------------------- END OF TESTS ------------



Template.map.onRendered(function() {
	this.autorun(function() {
    var margin = { top: 50, right: 0, bottom: 100, left: 30 },
      width = 960 - margin.left - margin.right,
      height = 430 - margin.top - margin.bottom,
      gridSize = Math.floor(width / 24),
      legendElementWidth = gridSize*2,
      buckets = 9,
      colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
      days = ["1", "2", "3", "4", "5", "6", "7"],
      times = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2", "3", "4", "5", "6", "7"];
      datasets = ["data/temp.tsv", "data/temp2.tsv"];

    var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dayLabels = svg.selectAll(".dayLabel")
      .data(days)
      .enter().append("text")
        .text(function (d) { return d; })
        .attr("x", 0)
        .attr("y", function (d, i) { return i * gridSize; })
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
        .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

    var timeLabels = svg.selectAll(".timeLabel")
      .data(times)
      .enter().append("text")
        .text(function(d) { return d; })
        .attr("x", function(d, i) { return i * gridSize; })
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + gridSize / 2 + ", -6)")
        .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

    var map = LoadedMap.findOne({});
    console.log(LoadedMap.find().count());
    console.log("MAP in room " + map);

    var comfortmapChart = function(update) { 
      var map = LoadedMap.findOne({});
      console.log(LoadedMap.find().count());
      console.log("MAP " + map);
      var cursor = Points.find({room: map.room, year: map.year, month: map.month, day: map.day});
      var data = [];
      cursor.forEach(function (point) {
        data.append(point);
      });
      var colorScale = d3.scale.quantile()
          .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
          .range(colors);

      var cards = svg.selectAll(".hour")
          .data(data, function(d) {return d.day+':'+d.hour;});

      cards.append("title");

      cards.enter().append("rect")
          .attr("x", function(d) { return (d.x) * gridSize; })
          .attr("y", function(d) { return (d.x) * gridSize; })
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("class", "hour bordered")
          .attr("width", gridSize)
          .attr("height", gridSize)
          .style("fill", colors[0]);

      cards.transition().duration(1000)
          .style("fill", function(d) { return colorScale(d.value); });

      cards.select("title").text(function(d) { return d.value; });
      
      cards.exit().remove();

      var legend = svg.selectAll(".legend")
        .data([0].concat(colorScale.quantiles()), function(d) { return d; });

      legend.enter().append("g")
        .attr("class", "legend");

      legend.append("rect")
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", height)
        .attr("width", legendElementWidth)
        .attr("height", gridSize / 2)
        .style("fill", function(d, i) { return colors[i]; });

      legend.append("text")
        .attr("class", "mono")
        .text(function(d) { return "≥ " + Math.round(d); })
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", height + gridSize);

      legend.exit().remove(); 
    };

    comfortmapChart(false);
    
    var datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button")
      .data(datasets);

    datasetpicker.enter()
      .append("input")
      .attr("value", function(d){ return "Dataset " + d })
      .attr("type", "button")
      .attr("class", "dataset-button")
      .on("click", function(d) {
        comfortmapChart(false);
      });
  })
/*
    var map = LoadedMap.findOne();
    var cursor = Points.find({room: map.room, year: map.year, month: map.month, day: map.day});
    cursor.forEach(function (point) {
      console.log("(" + point.x + ", " + point.y + ")");
    });

    var svg = d3.select('#circles').append('svg')
      .attr('width', 960)
      .attr('height', 430);

    var drawMap = function (update) {

    };

    LoadedMap.find().observe({
      added: function () {
        x = d3.scale.ordinal()
          .domain(d3.range(LoadedMap.findOne().data.length))
          .rangePoints([0, width], 1);
        drawMap(false);
      },
      changed: _.partial(drawMap, true)
    });
*/

	// 	var margin = { top: 50, right: 0, bottom: 100, left: 30 },
 //          width = 960 - margin.left - margin.right,
 //          height = 430 - margin.top - margin.bottom,
 //          gridSize = Math.floor(width / 24),
 //          legendElementWidth = gridSize*2,
 //          buckets = 9,
 //          colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
 //          days = ["1", "2", "3", "4", "5", "6", "7"],
 //          times = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2", "3", "4", "5", "6", "7"];
 //          datasets = ["data/temp.tsv", "data/temp2.tsv"];

 //      	var svg = d3.select("#chart").append("svg")
 //          .attr("width", width + margin.left + margin.right)
 //          .attr("height", height + margin.top + margin.bottom)
 //          .append("g")
 //          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

 //      	var dayLabels = svg.selectAll(".dayLabel")
 //          .data(days)
 //          .enter().append("text")
 //            .text(function (d) { return d; })
 //            .attr("x", 0)
 //            .attr("y", function (d, i) { return i * gridSize; })
 //            .style("text-anchor", "end")
 //            .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
 //            .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

 //      	var timeLabels = svg.selectAll(".timeLabel")
 //          .data(times)
 //          .enter().append("text")
 //            .text(function(d) { return d; })
 //            .attr("x", function(d, i) { return i * gridSize; })
 //            .attr("y", 0)
 //            .style("text-anchor", "middle")
 //            .attr("transform", "translate(" + gridSize / 2 + ", -6)")
 //            .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

 //      	var heatmapChart = function(tsvFile) {
 //        d3.tsv(tsvFile,
 //        function(d) {
 //          return {
 //            day: +d.day,
 //            hour: +d.hour,
 //            value: +d.value
 //          };
 //        },
 //        function(error, data) {
 //          var colorScale = d3.scale.quantile()
 //              .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
 //              .range(colors);

 //          var cards = svg.selectAll(".hour")
 //              .data(data, function(d) {return d.day+':'+d.hour;});

 //          cards.append("title");

 //          cards.enter().append("rect")
 //              .attr("x", function(d) { return (d.hour - 1) * gridSize; })
 //              .attr("y", function(d) { return (d.day - 1) * gridSize; })
 //              .attr("rx", 4)
 //              .attr("ry", 4)
 //              .attr("class", "hour bordered")
 //              .attr("width", gridSize)
 //              .attr("height", gridSize)
 //              .style("fill", colors[0]);

 //          cards.transition().duration(1000)
 //              .style("fill", function(d) { return colorScale(d.value); });

 //          cards.select("title").text(function(d) { return d.value; });
          
 //          cards.exit().remove();

 //          var legend = svg.selectAll(".legend")
 //              .data([0].concat(colorScale.quantiles()), function(d) { return d; });

 //          legend.enter().append("g")
 //              .attr("class", "legend");

 //          legend.append("rect")
 //            .attr("x", function(d, i) { return legendElementWidth * i; })
 //            .attr("y", height)
 //            .attr("width", legendElementWidth)
 //            .attr("height", gridSize / 2)
 //            .style("fill", function(d, i) { return colors[i]; });

 //          legend.append("text")
 //            .attr("class", "mono")
 //            .text(function(d) { return "≥ " + Math.round(d); })
 //            .attr("x", function(d, i) { return legendElementWidth * i; })
 //            .attr("y", height + gridSize);

 //          legend.exit().remove();

 //        });  
 //      };

 //      heatmapChart(datasets[0]);
      
 //      var datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button")
 //        .data(datasets);

 //      datasetpicker.enter()
 //        .append("input")
 //        .attr("value", function(d){ return "Dataset " + d })
 //        .attr("type", "button")
 //        .attr("class", "dataset-button")
 //        .on("click", function(d) {
 //          heatmapChart(d);
 //        });
	// })
});
