const PrimarySerial = Serial3;

PrimarySerial.setup(115200);
const external_conf = require('wifi_conf');

const SSID = external_conf.wifi_ssid;
const PASSWORD = external_conf.wifi_password;

var _http = require('http');

function getRequest() {
    var options = url.parse('https://api.telegram.org/bot1373678092:AAF_K05pB62iPztAYGaSqe8XIuf8ssSKogU/getMe');
    options.method = 'GET';

    var req = _http.get('https://www.howsmyssl.com/a/check', function (res) {
        print('Status: ' + res.statusCode);
        print('Headers: ' + JSON.stringify(res.headers));

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
    if (err) {
        print(err);
        return;
    }

    wifi.connect(SSID, PASSWORD, function (err_connect) {
        if (err_connect) {
            print(err_connect);
            return;
        }

        print('wifi ready');
        getRequest();
    });
});
