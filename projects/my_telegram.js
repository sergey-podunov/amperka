PrimarySerial.setup(115200);

var SSID = 'Beeline_2G_F32234';
var PASSWORD = 'Prikolist32';
const token = '1373678092:AAF_K05pB62iPztAYGaSqe8XIuf8ssSKogU';

var bot = require('@amperka/telegram').create({
    token: token,
    polling: { timeout: 10 }
});

bot.on('text', msg => {
    let fromId = msg.from.id;
    let firstName = msg.from.first_name;
    return bot.sendMessage(fromId, 'Welcome,'+firstName+'!');
});

var wifi = require('@amperka/wifi').setup(function(err) {
    wifi.connect(SSID, PASSWORD, function (err) {
        print('I\'m ready!');
        bot.connect();
    });
});
