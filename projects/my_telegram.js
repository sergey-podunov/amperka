const PrimarySerial = Serial3;
PrimarySerial.setup(115200);

const external_conf = require('wifi_conf');

const SSID = external_conf.wifi_ssid;
const PASSWORD = external_conf.wifi_password;

const telegram_conf = require('telegram_conf');
const token = telegram_conf.token;

var bot = require('telegram').create({
    token: token,
    polling: { timeout: 10 }
});

bot.on('text', msg => {
    let fromId = msg.from.id;
    let firstName = msg.from.first_name;
    return bot.sendMessage(fromId, 'Welcome,'+firstName+'!');
});

var wifi = require('@amperka/wifi').setup(function(err) {
    if (err) {
        print(err);
        return;
    }

    wifi.connect(SSID, PASSWORD, function (err_connect) {
        if (err) {
            print(err_connect);
            return;
        }

        print('I\'m ready!');
        bot.connect();
    });
});
