(function() {
	var Server = function() {
		this.login = null;
	};
	window.Server = Server;

	Server._formatFromServer = function(present) {
		var result = $.extend({}, present);
		result.creationDate = Server._longToDate(result.creationDate);
		result.offeredDate = Server._longToDate(result.offeredDate);
		return result;
	};
	Server._formatForServer = function(present) {
		var result = $.extend({}, present);
		result.to = parseInt(result.to);
		result.createdBy = parseInt(result.createdBy);
		result.offeredBy = parseInt(result.offeredBy);
		result.deletedBy = parseInt(result.deletedBy);
		return result;
	};
	Server._longToDate = function(long) {
		return !long ? null : new Date(long);
	};

	Server.prototype = {
		getPartyUri: function() {
			if (!this.login) {
				console.warn('calling server but login has not been set');
				return;
			}
			return 'authenticated-resources/party/' + this.login.partyId
		},
		addAuthorizationToAjaxOptions: function(ajaxOptions) {
			if (!this.login) {
				console.warn('calling server but login has not been set');
				return;
			}
			ajaxOptions.headers = {
				'dedguenodgo-partyId': this.login.partyId,
				'dedguenodgo-partyPassword': this.login.partyPassword,
			};
		},
		setLogin: function(login) {
			this.login = login;
		},
		wakeUp: function() {
			return $.get('unauthenticated-resources/wake-up');
		},
		addPresent: function(present) {
			var converted = Server._formatForServer(present);
			delete converted.id;
			var ajaxOptions = {
				url: this.getPartyUri() + '/present',
				contentType: 'application/json',
				type: 'POST',
				data: JSON.stringify(converted),
				dataType: "json"
			};
			this.addAuthorizationToAjaxOptions(ajaxOptions);
			return $.ajax(ajaxOptions).pipe(Server._formatFromServer);
		},
		editPresent: function(oldPresent, newPresent) {
			var converted = Server._formatForServer(newPresent);
			var ajaxOptions = {
				url: this.getPartyUri() + '/present/' + oldPresent.id,
				contentType: 'application/json',
				type: 'PUT',
				data: JSON.stringify(converted),
				dataType: "json"
			};
			this.addAuthorizationToAjaxOptions(ajaxOptions);
			return $.ajax(ajaxOptions).pipe(Server._formatFromServer);
		},
		addUser: function(user) {
			var ajaxOptions = {
				url: this.getPartyUri() + '/user',
				contentType: 'application/json',
				type: 'POST',
				data: JSON.stringify(user),
				dataType: "json"
			};
			this.addAuthorizationToAjaxOptions(ajaxOptions);
			return $.ajax(ajaxOptions);
		},
		deleteUser: function(userId) {
			var ajaxOptions = {
				url: this.getPartyUri() + '/user/' + userId,
				contentType: 'application/json',
				type: 'DELETE',
				dataType: "json"
			};
			this.addAuthorizationToAjaxOptions(ajaxOptions);
			return $.ajax(ajaxOptions);
		},
		getUsersAndPresents: function() {
			var ajaxOptions = {
				url: this.getPartyUri() + '/users-and-presents',
				contentType: 'application/json',
				type: 'GET',
				dataType: "json"
			};
			this.addAuthorizationToAjaxOptions(ajaxOptions);
			return $.ajax(ajaxOptions).pipe(function(result) {
				return {
					users: result.users,
					presents: result.presents.map(Server._formatFromServer)
				};
			});
		},
		getPartyUsers: function(credentials) {
			return $.ajax({
				url: 'unauthenticated-resources/party/' + credentials.id + '/users',
				contentType: 'application/json',
				type: 'GET',
				dataType: "json",
				data: credentials
			});
		}
	};
})();
