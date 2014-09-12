window.createStorageObservable = function(storage, propertyName) {
    var storedValue = null;
    try {
        storedValue = JSON.parse(storage.getItem(propertyName));
    } catch (e) {
        console.warn('corrupted value for ' + propertyName, e);
    }
    var result = ko.observable(storedValue);
    result.subscribe(function(value) {
        storage.setItem(propertyName, JSON.stringify(value));
    });
    return result;
};

window.entitiesToMap = function(arr) {
    if (!arr) { return {}; }
    var res = {};
    var len = arr.length;
    for (var i = 0; i < len; i++) {
        var item = arr[i];
        res[item.id] = item;
    }
    return res;
};
