PrimarySerial.setup(115200);

const external_conf = require('wifi_conf');

const SSID = external_conf.wifi_ssid;
const PASSWORD = external_conf.wifi_password;

var NAME = 'serpinar3456565';

var moisturePin = P6;

var dweet = require('@amperka/dweetio').connect(NAME);

function run() {
    setInterval(function () {
        var m = analogRead(moisturePin);
        print(m);
        dweet.send({
            moisture: m * 100
        });
    }, 1000);
}

var wifi = require('@amperka/wifi').setup(function (err) {
    if (err) {
        print(err);
        return;
    }

    wifi.connect(SSID, PASSWORD, function (err) {
        if (err) {
            print(err);
            return;
        }

        print('Click this link', dweet.follow());
        run();
    });
});
