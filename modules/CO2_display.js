var C = {
    VOLTAGE: 1,
    PPM: 0
};

var CO2_display = function (quadDisplay) {
    this._quadDisplay = quadDisplay;
    this._voltageVal = '';
    this._ppmVal = '';
    this._state = C.PPM;
}

CO2_display.prototype._update_display = function () {
    switch (this._state) {
        case C.VOLTAGE:
            this._quadDisplay.display('V' + this._voltageVal, true);
            break;
        default:
            this._quadDisplay.display(this._ppmVal, true);
    }
}

CO2_display.prototype.update_voltage = function (voltageVal) {
    this._voltageVal = voltageVal;
    this._update_display();
}

CO2_display.prototype.update_PPM = function (ppmVal) {
    this._ppmVal = ppmVal;
    this._update_display();
}

CO2_display.prototype.set_state = function (state) {
    this._state = state;
    this._update_display();
}

exports.create = function (quadDisplay) {
    return new CO2_display(quadDisplay);
}

exports.STATE = C;
