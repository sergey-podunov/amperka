PrimarySerial.setup(115200);
const external_conf = require('wifi_conf');

const SSID = external_conf.wifi_ssid;
const PASSWORD = external_conf.wifi_password;


var _http = require('http');

function getRequest() {
    var url = {
        host: 'hh.ru',
        port: 443,
        path: '/',
        method: 'GET',
        protocol: 'https:'
    };

    var req = _http.request(url, function (res) {
        res.on('data', function (d) {
            print(d);
        });

        res.on('close', function () {
            print('data transfer ened');
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
