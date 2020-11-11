//const BUTTON_PIN = P6;
const BUTTON_PIN = P3;
const LED_PIN = P7;


pinMode(BUTTON_PIN, 'input_pullup');

var myButton = require('@amperka/button').connect(BUTTON_PIN, {});

myButton.on('press', function() {
    console.log("Button is press");

  digitalWrite(LED_PIN, HIGH);
});

myButton.on('release', function() {
    console.log("Button is release");
    digitalWrite(LED_PIN, LOW);
});

myButton.on('click', function() {
    console.log("Button is click");
});


myButton.on('hold', function() {
    console.log("Button is hold");
});
