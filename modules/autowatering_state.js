var AutowateringState = function (ops) {
    this._start = ops.start;
    this._is_no_water = ops.no_water;
    this._active = false;
}

AutowateringState.prototype._get_state = function () {
    return { active: this._active, start: this._start, no_water: this._is_no_water };
}

AutowateringState.prototype.change_start = function (new_val) {
    this._start = new_val;
    this.emit('change', this._get_state());
}

AutowateringState.prototype.change_active = function (new_val) {
    this._active = new_val;
    this.emit('change', this._get_state());
}

AutowateringState.prototype.is_active = function () {
    return this._active;
}

AutowateringState.prototype.change_water_level = function (new_val) {
    this._is_no_water = new_val !== 'up';
    this.emit('change', this._get_state());
}

exports.create = function (ops) {
    return new AutowateringState(ops);
}
