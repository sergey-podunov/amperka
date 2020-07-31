PrimarySerial.setup(115200);

const external_conf = require('wifi_conf');

const SSID = external_conf.wifi_ssid;
const PASSWORD = external_conf.wifi_password;

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
