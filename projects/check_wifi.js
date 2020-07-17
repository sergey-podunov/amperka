Serial2.setup(115200);

var wifi = require('@amperka/wifi').setup(Serial2, function (err) {
    if (err) print(err);

    wifi.getAPs(function (err, aps) {
        if (err) print(err);
        print(aps);
    });
});
