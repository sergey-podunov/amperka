const READ_INTERVAL_SEC = 10;
const VOLTAGE_READ_TIMEOUT_SEC = 0.5;
const BUTTON_PIN = P7;

SPI2.setup({baud: 9600, mosi: B15, miso: B14, sck: B13});
let quadDisplay = require('@amperka/quaddisplay2').connect({spi: SPI2, cs: P9});

var blinkId;

var val = '----';
quadDisplay.display(val, true);

const conf = require('co2_conf');

var button = require('@amperka/button').connect(BUTTON_PIN, {});
let voltage_interval_id;
var show_voltage = false;

function showVoltage() {
  var voltage_percent = Math.round(analogRead(A2) * 100);
  quadDisplay.display('V' + voltage_percent, true);
  console.log("voltage = " + voltage_percent);
}

button.on('press', function() {
  show_voltage = true;
  showVoltage();
  voltage_interval_id = setInterval(showVoltage, VOLTAGE_READ_TIMEOUT_SEC * 1000);
});

button.on('release', function() {
  clearInterval(voltage_interval_id);
  quadDisplay.display(val, true);
  show_voltage = false;
});

var gasSensor = require('@amperka/gas-sensor').connect({
  dataPin: A0, // разъём SVG
  heatPin: P13, // разъём GHE
  model: 'MQ135',
  r0: conf.R0
});

function displayPreheat() {
  var dot = true;
  blinkId = setInterval(function () {
    if (dot) {
      quadDisplay.display(val + '.', true);
    } else {
      quadDisplay.display(val, true);
    }
    dot = !dot;
  }, 1000);
}

function displayHeated() {
  clearInterval(blinkId);
  quadDisplay.display(val, true);
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
      if (!show_voltage) {
        quadDisplay.display(val, true);
      }
    }, READ_INTERVAL_SEC * 1000);
  });
}

readAndShow();
