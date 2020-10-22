const BUTTON_PIN = P7;

var myButton = require('@amperka/button').connect(BUTTON_PIN, {});

myButton.on('press', function() {
    console.log("Button is press");
});

myButton.on('release', function() {
    console.log("Button is release");
});

myButton.on('click', function() {
    console.log("Button is click");
});


myButton.on('hold', function() {
    console.log("Button is hold");
});
