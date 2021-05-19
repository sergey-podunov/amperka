const NUM_ITEMS = 2;
const COLOR = { BLACK:0, YELLOW:1, GREEN:2, RED:3, WHITE:3 };

const FONT_SIZE = 25;
const LINE_MARGIN = 5;

var backLightPin = P6;

backLightPin.set();
var isLightOn = true;

var buttonPin = P12;
var cursorPin = P13;
pinMode(buttonPin, 'input_pullup');
pinMode(cursorPin, 'input_pullup');

var button = require('@amperka/button').connect(buttonPin, {holdTime: 0.5});
var cursorButton = require('@amperka/button').connect(cursorPin, {holdTime: 0.5});
var pointer = 0;

var startLineX = 20;

var firstLineY = 30;
var secondLineY = firstLineY + FONT_SIZE + LINE_MARGIN;

var colorPalette = new Uint16Array([0, 0xF80F, 0x001F, 0xF800, 0xFFFF]);
// var spi = new SPI();
// spi.setup({baud:3200000, mosi:B15, sck:B13, miso:B14});
SPI2.setup({baud:5600, mosi:B15, sck:B13, miso:B14});
// SPI2.setup();
var g = require("ST7735").connect({
    palette:colorPalette,
    spi:SPI2,
    dc:P7,
    cs:P3,
    rst:P2,
    height : 160 // optional, default=128
    // padx : 2 // optional, default=0
    // pady : 3 // optional, default=0
}, function() {
    g.setRotation(1);
    g.setFontVector(FONT_SIZE);
    g.clear();

    g.setColor(COLOR.YELLOW);
    g.drawString('vol:', startLineX, firstLineY);

    g.setColor(COLOR.GREEN);
    g.drawString('HIGH', startLineX + 55, firstLineY);

    g.setColor(COLOR.YELLOW);
    g.drawString('tmr:', startLineX, secondLineY);

    g.setColor(COLOR.GREEN);
    g.drawString('HIGH', startLineX + 55, secondLineY);

    g.setColor(COLOR.RED);
    g.drawString('>', 0, firstLineY);
    g.flip();

    button.on('click', function() {
        var color = isLightOn ? COLOR.BLACK : COLOR.GREEN;
        g.setColor(color);
        g.drawString('HIGH', startLineX + 55, firstLineY);
        g.flip();
        isLightOn = !isLightOn;
    });

    cursorButton.on('click', function () {
        console.log('click');
        console.log(firstLineY + ((FONT_SIZE + LINE_MARGIN) * pointer));
        g.setColor(COLOR.BLACK);
        g.drawString('>', 0, firstLineY + ((FONT_SIZE + LINE_MARGIN) * pointer));
        pointer = pointer + 1 === NUM_ITEMS ? 0 : pointer + 1;
        console.log(firstLineY + ((FONT_SIZE + LINE_MARGIN) * pointer));
        g.setColor(COLOR.RED);
        g.drawString('>', 0, firstLineY + ((FONT_SIZE + LINE_MARGIN) * pointer));
        g.flip();
    });
});

/*button.on('click', function() {
    console.log("I'm just pressed");
    console.log('backlight: ' + backLightPin.read());
    backLightPin.write(isLightOn = !isLightOn);
});*/


