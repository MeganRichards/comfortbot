Router.route('/data.csv', {
  where: 'server',
  action: function () {
    var map = LoadedMap.findOne({});
    var filename = "" + map.room + map.year + map.month + map.day + ".csv";
    var filedata = "x, y, temperature, radiant temperature, humidity, velocity\r\n";
    var cursor = Points.find({room: map.room, year: map.year, month: map.month, day: map.day});

    var headers = {
      'Content-type': 'text/csv',
      'Content-Disposition': "attachment; filename=" + filename
    };
    // build a CSV string. Oversimplified. You'd have to escape quotes and commas.
    cursor.forEach(function (point) {
      filedata += point.x + "," + point.y + "," + point.temp + ","  + point.rad_temp + "," + point.humidity + "," + point.velocity + "\r\n";
    });
    this.response.writeHead(200, headers);
    return this.response.end(filedata);
  }
});
Router.route('main', {
  path: '/'
});