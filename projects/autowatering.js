PrimarySerial.setup(115200);

const external_conf = require('autowatering_conf');

const SSID = external_conf.wifi_ssid;
const PASSWORD = external_conf.wifi_password;
const DWEET_NAME = external_conf.dweet_name;

const SEND_DWEET_INTERVAL_MS = 3000;
const MOISTURE_CHECK_INTERVAL_MS = 200;
const START_ACTIVE_INTERVAL_MS = 24 * 60 * 60 * 1000;
const ACTIVE_TIMEOUT_MS = 20 * 1000;

const MOISTURE_PIN = P6;
const MOISTURE_POWER_PIN = A4;

const PUMP_PIN = P11;
const WATER_LEVEL_PIN = P9;

var config = {
    start: true,
    hyst: {high: 0.4, highLag: 2, low: 0.3, lowLag: 2}
};

function getMoisture() {
    analogWrite(MOISTURE_POWER_PIN, 1);
    let moisture = analogRead(MOISTURE_PIN);
    analogWrite(MOISTURE_POWER_PIN, 0);
    return moisture;
}

var wifi_ready = false;

var dweet = require('@amperka/dweetio').connect(DWEET_NAME);

var hyst_moisture = require('hysteresis').create(config.hyst);
var is_moisture_level_low = getMoisture() <= config.hyst.low;

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
    conf_for_dweet.is_able_to_work = config.start && !is_no_water;
    conf_for_dweet.is_no_water = is_no_water;
    conf_for_dweet.water_level = water_level.read() === 'up' ? 1 : 0;
    conf_for_dweet.pump = pump_is_on ? 1 : 0;
    conf_for_dweet.moisture = getMoisture();
    conf_for_dweet.moisture_low = is_moisture_level_low ? 1 : 0;

    return conf_for_dweet;
}

function pump_on() {
    print('pump on');
    dweetSend({pump: 1});
    pump_is_on = true;
    pump.turnOn();
}

function pump_off() {
    print('pump off');
    dweet.send({pump: 0});
    pump_is_on = false;
    pump.turnOff();
}

function wifi_ready_callback() {
    setInterval(function () {
        var conf_for_dweet = convert_conf_to_dweet(config, 'conf_');
        dweetSend(conf_for_dweet);
    }, SEND_DWEET_INTERVAL_MS);
}

var wifi = require('@amperka/wifi').setup(function (err) {
    if (err) print(err);

    wifi.connect(SSID, PASSWORD, function (err) {
        if (err) {
            print(err);
        } else {
            wifi_ready = true;
        }

        if (wifi_ready) {
            print('wifi ready');
            print('Click this link', dweet.follow());
        }

        LED1.write(true);

        wifi_ready_callback();
    });
});

setInterval(function() {
    if (state.is_active()) {
        var moisture = getMoisture();
        hyst_moisture.push(moisture);
        print("hyst_moisture.state " + hyst_moisture._state, ", hyst_moisture.stable " + hyst_moisture._stable,
            "moisture " + moisture);
    }
}, MOISTURE_CHECK_INTERVAL_MS);


hyst_moisture.on('change', function (level) {
    if (state.is_active()) {
        print('hyst change - state: ' + level);
        state.change_moisture_level(level);
    }
});

hyst_moisture.on('change', function (level) {
    is_moisture_level_low = level === 'low';
});

water_level.on('down', function () {
    is_no_water = true;
    print('water down');
    dweetSend({water_level: 0});
    state.change_water_level('down');
});

water_level.on('up', function () {
    is_no_water = false;
    print('water up');
    dweetSend({water_level: 1});
    state.change_water_level('up');
});

state.on('change', function (new_state) {
    print('change state: ' + JSON.stringify(new_state));
    if (new_state.active && new_state.start && !new_state.no_water && new_state.moisture_low) {
        pump_on();
        return;
    }

    if (!new_state.active || !new_state.start || new_state.no_water || !new_state.moisture_low) {
        if (new_state.active && pump_is_on) {
            state._active = false;
        }

        pump_off();
    }
});

function dweetSend(data) {
    if (wifi_ready) {
        let ledInitialState = LED1.read();
        LED1.write(!ledInitialState);

        dweet.send(data, function () {
            LED1.write(ledInitialState);
        });
    }
}

function main_cycle() {
    print('change_active = true');
    state.change_active(true);

    setTimeout(function() {
        print('change_active = false');
        state.change_active(false);
    }, ACTIVE_TIMEOUT_MS);
}

main_cycle();

setInterval(main_cycle, START_ACTIVE_INTERVAL_MS);
