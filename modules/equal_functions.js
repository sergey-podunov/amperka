var EqualFunctions = function () {

}

EqualFunctions.prototype.deep_equal = function (obj1, obj2) {
    //Loop through properties in object 1
    for (var p in obj1) {
        //Check property exists on both objects
        if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false;

        switch (typeof (obj1[p])) {
            //Deep compare objects
            case 'object':
                if (!this.deep_equal(obj1[p], obj2[p])) return false;
                break;
            //Compare function code
            case 'function':
                if (typeof (obj2[p]) == 'undefined' || (p != 'compare' && obj1[p].toString() != obj2[p].toString())) return false;
                break;
            //Compare values
            default:
                if (obj1[p] != obj2[p]) return false;
        }
    }

    //Check object 2 for any extra properties
    for (var p in obj2) {
        if (typeof (obj1[p]) == 'undefined') return false;
    }
    return true;
};

EqualFunctions.prototype.shallowEqual = function(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (let key of keys1) {
        if (object1[key] !== object2[key]) {
            return false;
        }
    }

    return true;
}

exports.create = function () {
    return new EqualFunctions();
};
