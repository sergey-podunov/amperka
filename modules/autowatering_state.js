var AutowateringState = function (ops) {
    this._start = ops.start;
    this._is_no_water = ops.no_water;
    this._moisture_low = ops.moisture_low;
}

AutowateringState.prototype._get_state = function() {
    return { start: this._start, no_water: this._is_no_water, moisture_low: this._moisture_low };
}

AutowateringState.prototype.change_start = function (new_val) {
    this._start = new_val;
    this.emit('change', this._get_state());
}

AutowateringState.prototype.change_water_level = function (new_val) {
    this._is_no_water = new_val !== 'up';
    this.emit('change', this._get_state());
}

AutowateringState.prototype.change_moisture_level = function (new_val) {
    this._moisture_low = new_val === 'low';
    this.emit('change', this._get_state());
}

exports.create = function (ops) {
    return new AutowateringState(ops);
}
