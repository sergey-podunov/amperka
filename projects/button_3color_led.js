const MAIN_BUTTON_PIN = P3;
const CONTROL_RED_LED_PIN = P7;
const CONTROL_GREEN_LED_PIN = P10;

const GREEN_LED_PIN = P2;
const RED_LED_PIN = P12;

var settingsState = require('settings_state').create({
   controlPins: [CONTROL_GREEN_LED_PIN, CONTROL_RED_LED_PIN],
   infoPins: [GREEN_LED_PIN, RED_LED_PIN],
   buttonPin: MAIN_BUTTON_PIN,
   settings: {
       "interval" : {
           values: ["LOW", "HIGH"]
       },
       "volume": {
           values: ["LOW", "HIGH"]
       }
   },
});

settingsState.on('change', function (settings) {
    for(var settings_key in settings) {
        console.log(settings_key + ': ' + settings[settings_key]);
    }
});
