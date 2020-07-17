PrimarySerial.setup(115200);

var SSID = 'Beeline_2G_F32234';
var PASSWORD = 'Prikolist32';

var _http = require('http');

function getRequest() {
    var url = {
        host: '192.168.1.65',
        port: 80,
        path: '/conf/autowatering.json',
        method: 'GET',
        protocol: 'http:',
        headers: {
            'Authorization': 'Basic YXV0b3dhdGVyaW5nOnF3ZXJ0eTEyMw=='
        }
    };

    var req = _http.request(url, function (res) {
        var response = '';

        res.on('data', function (d) {
            response += d;
        });

        res.on('close', function () {
            var json = JSON.parse(response);
            print(json);
        });
    });

    req.on('error', (e) => {
        print('problem with request: code=' + e.code + ', message=' + e.message);
    });

    req.end();
}

var wifi = require('@amperka/wifi').setup(function (err) {
    if (err) print(err);

    wifi.connect(SSID, PASSWORD, function (err) {
        if (err) print(err);

        print('wifi ready');
        getRequest();
    });
});
