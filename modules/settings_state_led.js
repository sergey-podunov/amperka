var MODE = {
    READ: 0,
    WRITE: 1
}

const COLOR = { BLACK:0, YELLOW:1, GREEN:2, RED:3, WHITE:3 };
const COLOR_PALETTE = new Uint16Array([0, 0xF80F, 0x001F, 0xF800, 0xFFFF]);

const START_X = 20;
const START_Y = 30;
const VAL_OFFSET = 55;

const FONT_SIZE = 25;
const LINE_MARGIN = 5;

function _fillState(settings, currentValuesIndexes, settingsSize) {
    var state = {};
    for (var i = 0; i < settingsSize; i++) {
        state[settings[i].name] = settings[i].values[currentValuesIndexes[i]];
    }

    return state;
}

function _line_y(i) {
    return START_Y + ((FONT_SIZE + LINE_MARGIN) * i);
}

function _val_x() {
    return START_X + VAL_OFFSET;
}

var SettingsState = function (ops) {
    self = this;

    this._menuButton = ops.menuButton;
    this._setButton = ops.setButton;

    this._backLightPin = ops.LED.backLightPin;
    this._dcPin = ops.LED.dcPin;
    this._csPin = ops.LED.csPin;
    this._rstPin = ops.LED.rstPin;

    //todo control options borders
    this._currentSettingIndex = 0;

    this._settings = [];

    var settingsOrder = 0;
    for (const key in ops.settings) {
        this._settings[settingsOrder] = {name: key, values: ops.settings[key].values};
        settingsOrder++;
    }
    this._settingsSize = settingsOrder;

    this._currentValuesIndexes = [];

    for (var i = 0; i < this._settingsSize; i++) {
        this._currentValuesIndexes[i] = 0;
    }

    this._state = _fillState(this._settings, this._currentValuesIndexes, this._settingsSize);

    this.mode = MODE.READ;

    this._menuButton.on('click', function() {
        if (self.mode === MODE.WRITE) {
            self.nextSetting();
        }
    });

    this._menuButton.on('hold', function() {
        self.changeMode();
    });

    this._setButton.on('click', function() {
        if (self.mode === MODE.WRITE) {
            self.nextValue();
        }
    });

    this._backLightPin.set();

    var spi = new SPI();
    spi.setup({baud:3200000, mosi:B15, sck:B13, miso:B14});

    this._graphics = require("ST7735").connect({
        palette:COLOR_PALETTE,
        spi:spi,
        dc:this._dcPin,
        cs:this._csPin,
        rst:this._rstPin,
        height : 160 // optional, default=128
        // padx : 2 // optional, default=0
        // pady : 3 // optional, default=0
    }, function() {
        self._graphics.setRotation(1);
        self._graphics.setFontVector(FONT_SIZE);
        self._graphics.clear();

        var i = 0;
        for (const key in self._state) {
            self._graphics.setColor(COLOR.YELLOW);
            self._graphics.drawString(key + ':', START_X, _line_y(i));

            self._graphics.setColor(COLOR.GREEN);
            self._graphics.drawString(self._state[key], _val_x(), _line_y(i));
            i++;
        }

        self._graphics.flip();
    });
}


SettingsState.prototype.changeMode = function () {
    if (this.mode === MODE.READ) {
        this.mode = MODE.WRITE;

        this._graphics.setColor(COLOR.RED);
        this._graphics.drawString('>', 0, _line_y(this._currentSettingIndex));
        this._graphics.flip();
    } else {
        this.mode = MODE.READ;

        this._graphics.setColor(COLOR.BLACK);
        this._graphics.drawString('>', 0, _line_y(this._currentSettingIndex));
        this._graphics.flip();

        this._state = _fillState(this._settings, this._currentValuesIndexes, this._settingsSize);

        this.emit('change', this._state);
    }
}

function _cycledNextIndex(curentIndex, maxCount) {
    var nextIndex = curentIndex + 1;
    if (nextIndex === maxCount) {
        nextIndex = 0;
    }
   return nextIndex;
}

SettingsState.prototype.nextSetting = function () {
    if (this.mode === MODE.WRITE) {
        this._graphics.setColor(COLOR.BLACK);
        this._graphics.drawString('>', 0, _line_y(this._currentSettingIndex));

        this._currentSettingIndex = _cycledNextIndex(this._currentSettingIndex, this._settings.length);

        this._graphics.setColor(COLOR.RED);
        this._graphics.drawString('>', 0, _line_y(this._currentSettingIndex));
        this._graphics.flip();
    }
}

SettingsState.prototype.nextValue = function () {
    self = this;

    function _getCurrentValues() {
        return self._settings[self._currentSettingIndex].values;
    }

    function _getCurrentValue () {
        return _getCurrentValues()[self._currentValuesIndexes[self._currentSettingIndex]];
    }

    if (this.mode === MODE.WRITE) {
        this._graphics.setColor(COLOR.BLACK);
        this._graphics.drawString(_getCurrentValue(), _val_x(), _line_y(this._currentSettingIndex));

        this._currentValuesIndexes[this._currentSettingIndex] =
            _cycledNextIndex(this._currentValuesIndexes[this._currentSettingIndex], _getCurrentValues().length);

        this._graphics.setColor(COLOR.GREEN);
        this._graphics.drawString(_getCurrentValue(), _val_x(), _line_y(this._currentSettingIndex));
        this._graphics.flip();
    }
}

SettingsState.prototype.state = function () {
    return this._state;
}

exports.create = function (ops) {
    return new SettingsState(ops);
}
