PrimarySerial.setup(115200);

const external_conf = require('autowatering_conf');

const SSID = external_conf.wifi_ssid;
const PASSWORD = external_conf.wifi_password;
const DWEET_NAME = external_conf.dweet_name;

const SEND_DWEET_INTERVAL_MS = 3000;
const WATERING_DURATION_MS = 3 * 1000;

const PUMP_PIN = P11;
const WATER_LEVEL_PIN = P9;

const MENU_BUTTON_PIN = P12;
const SET_BUTTON_PIN = P13;

pinMode(MENU_BUTTON_PIN, 'input_pullup');
pinMode(SET_BUTTON_PIN, 'input_pullup');

var menuButton = require('@amperka/button').connect(MENU_BUTTON_PIN, {holdTime: 0.5});
var setButton = require('@amperka/button').connect(SET_BUTTON_PIN, {holdTime: 0.5});

const SETTINGS_MAP = {
    "vol": {
        "LOW": 5 * 1000,
        "HIGH": 10 * 1000
    },
    "tmr": {
        "LOW": 10 * 1000,
        "HIGH": 20 * 1000
    }
};

var settingsState = require('settings_state_led').create({
    menuButton: menuButton,
    setButton: setButton,
    LED: {
        backLightPin: P6,
        dcPin: P7,
        csPin: P3,
        rstPin: P2,
    },
    settings: {
        "vol" : {
            values: ["LOW", "HIGH"]
        },
        "tmr": {
            values: ["LOW", "HIGH"]
        }
    },
});

function fillSettings(changedSettings) {
    var settings = {};
    for(var settings_key in changedSettings) {
        settings[settings_key] = SETTINGS_MAP[settings_key][changedSettings[settings_key]]
        console.log(settings_key + ': ' + SETTINGS_MAP[settings_key][changedSettings[settings_key]]);
    }
    return settings;
}

var currentSettings = fillSettings(settingsState.state());

settingsState.on('change', function (changedSettings) {
    var oldSettings = currentSettings;
    currentSettings = fillSettings(changedSettings);

    if (oldSettings != null
        && oldSettings.hasOwnProperty("tmr")
        && oldSettings["tmr"] !== currentSettings["tmr"]) {
          clearInterval(mainIntervalId);
          mainIntervalId = setInterval(main_cycle, currentSettings["tmr"]);
    }
});

var config = {
    start: true,
    hyst: {high: 0.2, highLag: 2, low: 0.05, lowLag: 2}
};

var mainTimeoutId = null;
var mainIntervalId = null;

var wifi_ready = false;

var dweet = require('@amperka/dweetio').connect(DWEET_NAME);

var pump = require('@amperka/power-control').connect(PUMP_PIN);
pump.turnOff();
var pump_is_on = false;

var water_level = require('@amperka/water-level').connect(WATER_LEVEL_PIN);
var is_no_water = water_level.read() !== 'up';

var state = require('autowatering_state').create(
    { start: config.start, no_water: is_no_water }
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

    return conf_for_dweet;
}

function pump_on() {
    print('pump on');
    dweetSend({pump: 1});
    pump_is_on = true;
    pump.turnOn();

    setTimeout(function () {
        pump_off();
    }, currentSettings["vol"]);
}

function pump_off() {
    if (pump_is_on) {
        print('pump off');
        dweetSend({pump: 0});
        pump_is_on = false;
        pump.turnOff();
    }
}

function wifi_ready_callback() {
    setInterval(function () {
        var conf_for_dweet = convert_conf_to_dweet(config, 'conf_');
        dweetSend(conf_for_dweet);
    }, SEND_DWEET_INTERVAL_MS);
}

/*var wifi = require('@amperka/wifi').setup(function (err) {
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
});*/

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
    if (new_state.active && new_state.start && !new_state.no_water) {
        pump_on();
        return;
    }

    if (!new_state.active || !new_state.start || new_state.no_water) {
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

    mainTimeoutId = setTimeout(function() {
        print('change_active = false');
        state.change_active(false);
    }, currentSettings["vol"] * 2);
}

main_cycle();

mainIntervalId = setInterval(main_cycle, currentSettings["tmr"]);
