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
