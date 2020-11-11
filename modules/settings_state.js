var MODE = {
    READ: 0,
    WRITE: 1
}

function _fillState(settings, currentValuesIndexes, settingsSize) {
    var state = {};
    for (var i = 0; i < settingsSize; i++) {
        state[settings[i].name] = settings[i].values[currentValuesIndexes[i]];
    }

    return state;
}

function blink(pin, timeSec) {
    var  on = false;
    return setInterval(function() {
        on = !on;
        pin.write(on);
    }, timeSec * 1000);
}

var SettingsState = function (ops) {
    self = this;

    //todo control options borders
    this._currentSettingIndex = 0;

    this.controlPins = ops.controlPins;
    this.infoPins = ops.infoPins;

    this._settings = [];

    var settings_order = 0;
    for (const key in ops.settings) {
        this._settings[settings_order] = {name: key, values: ops.settings[key].values};
        settings_order++;
    }
    this._settingsSize = settings_order;

    this._currentValuesIndexes = [];

    for (var i = 0; i < this._settingsSize; i++) {
        this._currentValuesIndexes[i] = 0;
    }

    this._state = _fillState(this._settings, this._currentValuesIndexes, this._settingsSize);

    this.mode = MODE.READ;
    this.controlBlinkId = null;

    this.controlPins[this._currentSettingIndex].write(HIGH);
    this.infoPins[this._currentValuesIndexes[this._currentSettingIndex]].write(HIGH);

    pinMode(ops.buttonPin, 'input_pullup');

    this.button = require('@amperka/button').connect(ops.buttonPin, {holdTime: 0.5});

    this.button.on('click', function() {
        if (self.mode === MODE.READ) {
            self.nextSetting();
        } else {
            self.nextValue();
        }
    });

    this.button.on('hold', function() {
        self.changeMode();
    });
}

SettingsState.prototype.changeMode = function () {
    if (this.mode === MODE.READ) {
        this.mode = MODE.WRITE;
        this.controlBlinkId = blink(this.infoPins[this._currentValuesIndexes[this._currentSettingIndex]], 0.5);
    } else {
        this.mode = MODE.READ;
        if (this.controlBlinkId) {
            clearInterval(this.controlBlinkId);
        }

        this.infoPins[this._currentValuesIndexes[this._currentSettingIndex]].write(HIGH);
        this._state = _fillState(this._settings, this._currentValuesIndexes, this._settingsSize);

        this.emit('change', this._state);
    }
}

function _nextIndex(curentIndex, array) {
    var maxCount = array.length;
    var nextIndex = curentIndex + 1;
    if (nextIndex === maxCount) {
        nextIndex = 0;
    }
   return nextIndex;
}

SettingsState.prototype.nextSetting = function () {
    this.controlPins[this._currentSettingIndex].write(LOW);
    this.infoPins[this._currentValuesIndexes[this._currentSettingIndex]].write(LOW);

    this._currentSettingIndex = _nextIndex(this._currentSettingIndex, this.controlPins);

    this.controlPins[this._currentSettingIndex].write(HIGH);
    this.infoPins[this._currentValuesIndexes[this._currentSettingIndex]].write(HIGH);
}

SettingsState.prototype.nextValue = function () {
    if (this.mode === MODE.WRITE) {
        console.log('nextValue - mode write');
        clearInterval(this.controlBlinkId);
        this.infoPins[this._currentValuesIndexes[this._currentSettingIndex]].write(LOW);

        this._currentValuesIndexes[this._currentSettingIndex] = _nextIndex(this._currentValuesIndexes[this._currentSettingIndex], this.infoPins);

        this.controlBlinkId = blink(this.infoPins[this._currentValuesIndexes[this._currentSettingIndex]], 0.5);
    }
}

SettingsState.prototype.state = function () {
    return this._state;
}

exports.create = function (ops) {
    return new SettingsState(ops);
}
