PrimarySerial.setup(115200);

var SSID = 'Beeline_2G_F32234';
var PASSWORD = 'Prikolist32';
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
