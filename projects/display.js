SPI2.setup({baud: 9600, mosi: B15, miso: B14, sck: B13});
let quadDisplay = require('@amperka/quaddisplay2').connect({spi: SPI2, cs: P9});

let i = 0;
setInterval(function () {
    if (i <= 100) {
        quadDisplay.display(i + '.' + 0, true);
        i++;
    }
}, 1000);
