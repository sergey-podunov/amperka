SPI2.setup({baud: 9600, mosi: B15, miso: B14, sck: B13});
let quadDisplay = require('@amperka/quaddisplay2').connect({spi: SPI2, cs: P9});

var gasSensor = require('@amperka/gas-sensor').connect({
  dataPin: A0, // разъём SVG
  heatPin: P10, // разъём GHE
  model: 'MQ135'
});

gasSensor.preheat(function() {
  var r0 = gasSensor.calibrate();
  print('r0 = ', r0);

  setInterval(function() {
    var val = Math.round(gasSensor.read('CO2'));
    print('LPG PPM =', val);
    quadDisplay.display(val, true);
  }, 1000);
});
