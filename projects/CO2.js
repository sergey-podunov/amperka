const READ_INTERVAL_SEC = 10;
const VOLTAGE_READ_TIMEOUT_SEC = 0.5;
const BUTTON_PIN = P7;

SPI2.setup({baud: 9600, mosi: B15, miso: B14, sck: B13});
let quadDisplay = require('@amperka/quaddisplay2').connect({spi: SPI2, cs: P9});
var co2Display = require('CO2_display');
var display = co2Display.create(quadDisplay);
const DISPLAY_STATE = co2Display.STATE;

let blinkId;

var val = '----';
display.update_PPM(val);

const conf = require('co2_conf');

var button = require('@amperka/button').connect(BUTTON_PIN, {});
let voltage_interval_id;

function showVoltage() {
  var voltage_percent = Math.round(analogRead(A2) * 100);
  display.update_voltage(voltage_percent);
  console.log("voltage = " + voltage_percent);
}

button.on('press', function() {
  display.set_state(DISPLAY_STATE.VOLTAGE);
  showVoltage();
  voltage_interval_id = setInterval(showVoltage, VOLTAGE_READ_TIMEOUT_SEC * 1000);
});

button.on('release', function() {
  clearInterval(voltage_interval_id);
  display.set_state(DISPLAY_STATE.PPM);
  display.update_PPM(val);
});

var gasSensor = require('@amperka/gas-sensor').connect({
  dataPin: A0, // разъём SVG
  heatPin: P13, // разъём GHE
  model: 'MQ135',
  r0: conf.R0
});

function displayPreheat() {
  var dot = true;
  setInterval(function () {
    if (dot) {
      display.update_PPM(val + '.');
    } else {
      display.update_PPM(val);
    }
    dot = !dot;
  }, 1000);
}

function displayHeated() {
  clearInterval(blinkId);
  display.update_PPM(val);
}

function readAndShow() {
  displayPreheat();
  gasSensor.preheat(function() {
    displayHeated();
    var r0 = gasSensor.calibrate();
    print('r0 = ', r0);

    setInterval(function () {
      val = Math.round(gasSensor.read('CO2'));
      print('CO2 PPM = ', val);
      display.update_PPM(val);
    }, READ_INTERVAL_SEC * 1000);
  });
}

readAndShow();
