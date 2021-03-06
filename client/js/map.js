import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import '../map.html';


Template.map.onCreated(function mapOnCreated() {
  //Meteor.subscribe('loaded_map');
  this.comfort = new ReactiveVar(0);
  this.point = new ReactiveVar({});

  this.d = new ReactiveVar({});
});


Template.map.helpers({
  room_name() {
	return LoadedMap.findOne({}).room;;
  },
  month() {
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[LoadedMap.findOne({}).month];
  },
  day() {
    return LoadedMap.findOne({}).day;
  },
  year() {
    return LoadedMap.findOne({}).year;
  },
  comfort() {
    return Template.instance().comfort.get();
  },
  point() {
	  return Template.instance().point.get();
  },
  // shorten long float values
  shorten_float(f) {
	dec_points = 2;
	return f.toFixed(dec_points);
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

// TODO: use a selection var to choose what data to display
// from the d database variable
var get_data = function(d, selection) {
  return pierceSet(d.temp, d.rad_temp, d.velocity, d.humidity, 1, 0.6, 65, 83.4);
};

Template.map.onRendered(function() {
  // instance for the d3 event to use
  // otherwise I'd have to use the database for clicking stuff
  var instance = Template.instance();

	this.autorun(function() {
    var margin = { top: 50, right: 0, bottom: 100, left: 30 },
      width = 960 - margin.left - margin.right,
      height = 580 - margin.top - margin.bottom,
      gridSize = Math.floor(width / 24),
      legendElementWidth = gridSize*2,
      buckets = 9,
      colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
      // TODO: make days + times dynamic
      days = ["1", "2", "3", "4", "5", "6", "7"],
      times = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2", "3", "4", "5", "6", "7"];

    var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var comfortmapChart = function(update) { 
      if (LoadedMap.find().count() == 0) return;

      // link to Rooms.findOne({name: map.room}).x and y;
      var room_name = LoadedMap.findOne().room;
      var room = Rooms.findOne({name: room_name});
      var dim_x =room.x, dim_y = room.y;

      // update height of svg canvas
      var height = gridSize * dim_y + 100;
      svg.attr("height", height);
      console.log("WIDTH: " + height);

      days = [];
      times = [];
      for (i = 0; i < dim_x; i++) {
        days.push(i);
      }
      for (i = 0; i < dim_y; i++) {
        times.push(i);
      }
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
          .attr("class", function(d, i) { return ((i >= 4 && i <= 9) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

      var map = LoadedMap.findOne({});      
      //var cursor = Points.find({room: "BBW280", year: 2017, month: 2, day: 14});      
      var cursor = Points.find({room: map.room, year: map.year, month: map.month, day: map.day});
      var data = [];
      cursor.forEach(function (point) {
        //console.log(point.x + ", " + point.y);
        data.push(point);
      });

      var colorScale = d3.scale.quantile()
          //.domain([20, 0, 30])
          // might need to change domain based on reasonable values idk
          .domain([d3.min(data, function(d) { return get_data(d, 0) }) - 5, d3.max(data, function (d) { return get_data(d, 0); })])
          .range(colors);

      var cards = svg.selectAll(".hour")
          .data(data, function(d) {return d.x+':'+d.y;});

      cards.append("title");

      cards.enter().append("rect")
          .attr("x", function(d) { return (d.x) * gridSize; })
          .attr("y", function(d) { return (d.y) * gridSize; })
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("class", "hour bordered")
          .attr("width", gridSize)
          .attr("height", gridSize)
          .attr("data-popbox", "stats")
          .style("fill", colors[0]);

      cards.transition().duration(1000)
          .style("fill", function(d) { return colorScale(get_data(d, 0)); });

      cards.select("title").text(function(d) { return get_data(d, 0); });

      // update stats template
      cards.on("click", function(d, i) {

		instance.point.set(d);
        instance.comfort.set(get_data(d, 0));


        // ATTENTION!!!  This portion is terrible.
        // This is because I added a cool triangle to the left
        // of the "stats" box, which is a visual aid for seeing
        // which box you're seeing values for.
        // However, the css uses static values, so if anything
        // changes, like the size of each data point box, this 
        // suddenly doesn't work.  My recommendation is to use 
        // jquery with the .css() option to pass in calculated values
        // here.  Then, the box will get drawn properly for any size,
        // which is what we want.  What needs to change is the
        // .triangle-isosceles.left:after {top: 55px} value.
        // That needs to be dynamic.  And possibly the border-width
        // in that one too.  I don't know what else.
        if (d == instance.d.get()) {
          instance.d.set({});
          $("#stats").hide();
        } else {
          instance.d.set(d);
          $("#stats").show();

          // calculate position of the box
          var target = '#stats';
          var position = $("#chart").offset();
          position.top += d.y*gridSize + margin.top + gridSize / 2 - ($(target).outerHeight() / 2);
          position.left += d.x*gridSize + margin.left + gridSize / 2 + 50;
          console.log("position after" + position.top + ", " + position.left);          
          $("#stats").css('top', position.top).css('left', position.left);
        }
      });
      
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

    //var datas = Points.find({room: map.room, year: map.year, month: map.month, day: map.day});
    LoadedMap.find().observe({
    //Points.find({room: map.room, year: map.year, month: map.month, day: map.day}).observe({
      added: function () {
        var map = LoadedMap.findOne({});
        Points.find({room: map.room, year: map.year, month: map.month, day: map.day}).observe({
          added: function () {
            comfortmapChart(false);
          },
          changed: _.partial(comfortmapChart, true)
        });
        // x = d3.scale.ordinal()
        //   .domain(d3.range(LoadedMap.findOne().data.length))
        //   .rangePoints([0, width], 1);
        comfortmapChart(false);
      },
      changed: _.partial(comfortmapChart, true)
    });
  })
});
