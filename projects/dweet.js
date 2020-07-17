var SSID = 'wild_beaver';
var PASSWORD = 'Prikolist32';
var NAME = 'serpinar3456565';

var dweet = require('@amperka/dweetio').connect(NAME);
 
function run() {
  setInterval(function() {
    var m = analogRead(A0);
    print(m);
    dweet.send({
      moisture: m * 100
    });
  }, 1000);
}
 
var wifi = require('@amperka/wifi').setup(function(err) {
  wifi.connect(SSID, PASSWORD, function(err) {
    print('Click this link', dweet.follow());
    run();
  });
});