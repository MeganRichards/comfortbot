//will need to have correct map loaded
// var cursor = Points.find({room: map.room, year: map.year, month: map.month, day: map.day});

// Router.map(function() {
//   this.route('txtFile', {
//     where: 'server',
//     path: '/text',
//     action: function() {
//       var filedata = "";
//       var filename = map.room_name + map.year + map.month + map.day + '.csv';

//       var headers = {
//         'Content-Type': 'text/plain',
//         'Content-Disposition': "attachment; filename=" + filename
//       };
//       cursor.forEach(function (point) {
//         filedata += point.x + "," + point.y + "," + point.temp + ","  + point.radtemp + "," + point.humid + "," + point.veolcity + "\r\n";
//       });
//       this.response.writeHead(200, headers);
//       return this.response.end(text);
//     }
//   })
// });

Router.route('main', {
  path: '/'
});