const MENU_BUTTON_PIN = P12;
const SET_BUTTON_PIN = P13;

pinMode(MENU_BUTTON_PIN, 'input_pullup');
pinMode(SET_BUTTON_PIN, 'input_pullup');

var menuButton = require('@amperka/button').connect(MENU_BUTTON_PIN, {holdTime: 0.5});
var setButton = require('@amperka/button').connect(SET_BUTTON_PIN, {holdTime: 0.5});

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

settingsState.on('change', function (settings) {
    for(var settings_key in settings) {
        console.log(settings_key + ': ' + settings[settings_key]);
    }
});
