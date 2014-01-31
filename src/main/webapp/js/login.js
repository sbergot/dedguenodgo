(function() {
	function createStorageObservable(storage, propertyName) {
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
	}

	window.LoginViewModel = function(server) {
		this._server = server;

		this.partyId = createStorageObservable(localStorage, 'partyId');
		this.partyPassword = createStorageObservable(sessionStorage, 'partyPassword');
		this.userIdChoice = createStorageObservable(localStorage, 'login-userIdChoice');

		this.loadingParty = ko.observable(false);
		this.partyOk = ko.observable(false);
		this.loadingUser = ko.observable(false);
		this.userOk = ko.observable(false);
	};

	window.LoginViewModel.prototype = {
		submitParty: function() {
		
		},
		submitUser: function() {
		
		},
		addUser: function() {},
		deleteUser: function() {}
	};
})();
