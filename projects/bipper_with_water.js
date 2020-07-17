var hyst = require('@amperka/hysteresis')
  .create({high: 0.5, highLag: 2, low: 0.4, lowLag: 2});
 
var buzzer = require('@amperka/buzzer').connect(A1);
 
setInterval(function() {
  hyst.push(analogRead(A0));
}, 200);
 
hyst.on('low', function() {
  buzzer.beep(1, 0.5);
});
 
hyst.on('high', function() {
  buzzer.turnOff();
});