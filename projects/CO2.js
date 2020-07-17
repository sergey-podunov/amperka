var gasSensor = require('@amperka/gas-sensor').connect({
  dataPin: A0, // разъём SVG
  heatPin: P10, // разъём GHE
  model: 'MQ135'
});
 
gasSensor.preheat(function() {
  var basePpm = gasSensor.calibrate();
  print('PPM base in current environment: ', basePpm);
 
  setInterval(function() {
    var val = gasSensor.read('CO2');
    print('LPG PPM =', val);
  }, 1000);
});