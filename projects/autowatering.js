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
var is_moisture_level_low = analogRead(MOISTURE_PIN) <= config.hyst.low;

var pump = require('@amperka/power-control').connect(PUMP_PIN);
pump.turnOff();
var pump_is_on = false;

var water_level = require('@amperka/water-level').connect(WATER_LEVEL_PIN);
var is_no_water = water_level.read() !== 'up';

var state = require('autowatering_state').create(
    { start: config.start, no_water: is_no_water, moisture_low: is_moisture_level_low }
    );

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
    conf_for_dweet.moisture_low = is_moisture_level_low ? 1 : 0;

    return conf_for_dweet;
}

function is_changed(conf_old, conf_new) {
    return !equal_functions.deep_equal(conf_old, conf_new);
}

function pump_on() {
    print('pump on');
    dweet.send({pump: 1});
    pump_is_on = true;
    pump.turnOn();
}

function pump_off() {
    print('pump off');
    dweet.send({pump: 0});
    pump_is_on = false;
    pump.turnOff();
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
                    state.change_start(config.start);
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

hyst.on('change', function (level) {
    print('hyst change - state: ' + level);
    state.change_moisture_level(level);
});

hyst.on('change', function (level) {
    is_moisture_level_low = level === 'low';
});

water_level.on('down', function () {
    is_no_water = true;
    print('water down');
    dweet.send({water_level: 0});
    state.change_water_level('down');
});

water_level.on('up', function () {
    is_no_water = false;
    print('water up');
    dweet.send({water_level: 1});
    state.change_water_level('up');
});

state.on('change', function (new_state) {
    print('change state: ' + JSON.stringify(new_state));
    if (new_state.start && !new_state.no_water && new_state.moisture_low) {
        pump_on();
        return;
    }

    if (!new_state.start || new_state.no_water || !new_state.moisture_low) {
        pump_off();
    }
});
