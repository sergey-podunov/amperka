PrimarySerial.setup(115200);

const external_conf = require('autowatering_conf');

const SSID = external_conf.wifi_ssid;
const PASSWORD = external_conf.wifi_password;
const DWEET_NAME = external_conf.dweet_name;

const CONFIG_HOST = external_conf.config_host;
const CONFIG_PATH = external_conf.config_path;
const CONFIG_LOGIN = external_conf.config_login;
const CONFIG_PASS = external_conf.config_pass;

const READ_CONF_INTERVAL_MS = 5000;
const SEND_DWEET_INTERVAL_MS = 1000;
const MOISTURE_CHECK_INTERVAL_MS = 200;

const MOISTURE_PIN = P6;
const PUMP_PIN = P11;
const WATER_LEVEL_PIN = P9;

var config = {
    start: false,
    hyst: {high: 0.5, highLag: 2, low: 0.3, lowLag: 2}
};

var config_reader = require('config_reader').connect({
    host: CONFIG_HOST,
    path: CONFIG_PATH,
    login: CONFIG_LOGIN,
    pass: CONFIG_PASS
});

var equal_functions = require('equal_functions').create();

var dweet = require('@amperka/dweetio').connect(DWEET_NAME);
var hyst = require('hysteresis').create(config.hyst);

var pump = require('@amperka/power-control').connect(PUMP_PIN);
pump.turnOff();
var pump_is_on = false;

var water_level = require('@amperka/water-level').connect(WATER_LEVEL_PIN);

var is_no_water = water_level.read() !== 'up';

function convert_conf_to_dweet(conf, prefix) {
    var conf_for_dweet = {};
    for (var conf_key in conf) {
        if (conf.hasOwnProperty(conf_key)) {
            var dweet_key = prefix + conf_key;
            switch (typeof (conf[conf_key])) {
                case 'object':
                    var obj_for_dweet = convert_conf_to_dweet(conf[conf_key], prefix + conf_key + '_');
                    for (var obj_key in obj_for_dweet) {
                        conf_for_dweet[obj_key] = obj_for_dweet[obj_key];
                    }
                    break;
                case 'function':
                    break;
                default:
                    conf_for_dweet[dweet_key] = conf[conf_key];
            }
        }
    }
    conf_for_dweet.is_able_to_work = is_able_to_work();
    conf_for_dweet.is_no_water = is_no_water;
    conf_for_dweet.water_level = water_level.read() === 'up' ? 1 : 0;
    conf_for_dweet.pump = pump_is_on ? 1 : 0;
    conf_for_dweet.moisture = analogRead(MOISTURE_PIN);

    return conf_for_dweet;
}

function is_changed(conf_old, conf_new) {
    return !equal_functions.deep_equal(conf_old, conf_new);
}

function wifiReady() {
    setInterval(function () {
        config_reader.read(
            function (config_json) {
                if (config_json && is_changed(config.hyst, config_json.hyst)) {
                    hyst.update(config_json.hyst);
                    print('hyst update with: ' + config_json.hyst);
                }

                if (config_json && is_changed(config, config_json)) {
                    config = config_json;
                    if (config.start) {
                        pump_on();
                    } else {
                        pump_off();
                    }
                }
            }
        );
    }, READ_CONF_INTERVAL_MS);

    setInterval(function () {
        var conf_for_dweet = convert_conf_to_dweet(config, 'conf_');
        dweet.send(conf_for_dweet);
    }, SEND_DWEET_INTERVAL_MS);
}

var wifi = require('@amperka/wifi').setup(function (err) {
    if (err) print(err);

    wifi.connect(SSID, PASSWORD, function (err) {
        if (err) print(err);

        print('wifi ready');
        print('Click this link', dweet.follow());
        wifiReady();
    });
});

function is_able_to_work() {
    return config.start && !is_no_water;
}

setInterval(function() {
    hyst.push(analogRead(MOISTURE_PIN));
}, MOISTURE_CHECK_INTERVAL_MS);

function pump_on() {
    print('is able to work: ' + is_able_to_work());
    print('config.start: ' + config.start);
    print('is_no_water: ' + is_no_water);
    print(water_level.read());
    if (is_able_to_work()) {
        print('pump on');
        dweet.send({pump: 1});
        pump.turnOn();
    }
}

function pump_off() {
    dweet.send({pump: 0});
    print('pump off');
    pump.turnOff();
}

hyst.on('low', pump_on);
hyst.on('high', pump_off);

water_level.on('down', function () {
    pump_off();
    is_no_water = true;
    print('water down');
    dweet.send({water_level: 0});
});

water_level.on('up', function () {
    is_no_water = false;
    print('water up');
    dweet.send({water_level: 1});
});
