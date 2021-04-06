var settingsState = require('settings_state_led').create({
   menuButtonPin: P12,
   setButtonPin: P13,
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
