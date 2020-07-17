var Dweetio = function(name) {
  this._name = name || 'amperka';
  this._url = ['http://dweet.io/dweet/for/', this._name].join('');
  this._http = require('http');
  this._gotResp = false;
};

Dweetio.prototype._request = function(query, callback) {
  print('url: ' + this._url + '?' + query);
  this._http.get(this._url + '?' + query, function(res) {
    var d = '';
    res.on('data', function(data) {
      print('resp data : ' + data);
      d += data;
    });
    res.on('close', function() {
      print('close: ' + d);
      callback(d);
    });
  }).on('error', function(e) {
    print('error: ' + e.message);
  });

  // request.end();
};

Dweetio.prototype.send = function(data, callback) {
  var a = [];
  for (var prop in data) {
    a.push(encodeURIComponent(prop) + '=' + encodeURIComponent(data[prop]));
  }
  callback = callback || function() {};
  this._request(a.join('&'), callback);
};

Dweetio.prototype.follow = function() {
  return 'https://dweet.io/follow/' + this._name;
};

exports.connect = function(name) {
  return new Dweetio(name);
};
