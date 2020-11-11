const MAIN_BUTTON_PIN = P3;
const SET_BUTTON_PIN = P6;
const CONTROL_RED_LED_PIN = P7;
const CONTROL_GREEN_LED_PIN = P10;

const GREEN_LED_PIN = P2;
// const BLUE_LED_PIN = P3;
const RED_LED_PIN = P12;

pinMode(MAIN_BUTTON_PIN, 'input_pullup');
pinMode(SET_BUTTON_PIN, 'input_pullup');

var mainButton = require('@amperka/button').connect(MAIN_BUTTON_PIN, {});
var setButton = require('@amperka/button').connect(SET_BUTTON_PIN, {});

var settingsState = require('settings_state').create({
   controlPins: [CONTROL_GREEN_LED_PIN, CONTROL_RED_LED_PIN],
   infoPins: [GREEN_LED_PIN, RED_LED_PIN],
   settings: {
       "interval" : {
           values: ["LOW", "HIGH"]
       },
       "volume": {
           values: ["LOW", "HIGH"]
       }
   },
});

const WATERING_INTERVAL = {
    "LOW": 3,
    "HIGH": 7
};

const WATER_VOLUME = {
    "LOW": 10,
    "HIGH": 15
};

const INTERVAL_LED = {
    "LOW": GREEN_LED_PIN,
    "HIGH": RED_LED_PIN,
};

const VOLUME_LED = {

};

var currentInterval = "LOW";
var currentVolume = "LOW";

mainButton.on('click', function() {
    console.log("Button is click");
    settingsState.nextSetting();
});

mainButton.on('hold', function() {
    console.log("Button is hold");
    settingsState.changeMode();
});

setButton.on('click', function () {
    console.log("set is click");
   settingsState.nextValue();
});

// digitalWrite(CONTROL_LED_PIN, HIGH);
// digitalWrite(GREEN_LED_PIN, LOW);
// digitalWrite(BLUE_LED_PIN, LOW);
// digitalWrite(RED_LED_PIN, LOW);
//
// digitalWrite(INTERVAL_LED[currentInterval], HIGH);
