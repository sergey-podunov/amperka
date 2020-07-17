var SSID = 'wild_beaver';
var PASSWORD = 'Prikolist32';
var NAME = 'serpinar3456565';


var _http = require('http');

function getRequest() {
    var url = {
        host: 'yandex.ru',
        port: 443,
        path: '/',
        method: 'GET',
        protocol: 'https:'
    };

    var req = _http.request(url, function (res) {
        var response = '';

        res.on('data', function (d) {
            response += d;
        });

        res.on('close', function () {
            print('data: ' + response);
        });
    });

    req.on('error', (e) => {
        print('problem with request: code=' + e.code + ', message=' + e.message);
    });

    req.end();
}


var wifi = require('@amperka/wifi').setup(function (err) {
    wifi.connect(SSID, PASSWORD, function (err) {
        print('wifi ready');
        getRequest();
    });
});
