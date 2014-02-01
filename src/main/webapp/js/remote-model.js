(function() {
	var Server = function() {};
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
		addPresent: function(present) {
			var converted = Server._formatForServer(present);
			delete converted.id;
			return $.ajax({
				url: 'authenticated-resources/present',
				contentType: 'application/json',
				type: 'POST',
				data: JSON.stringify(converted),
				dataType: "json"
			}).pipe(Server._formatFromServer);
		},
		editPresent: function(oldPresent, newPresent) {
			var converted = Server._formatForServer(newPresent);
			return $.ajax({
				url: 'authenticated-resources/present/' + oldPresent.id,
				contentType: 'application/json',
				type: 'PUT',
				data: JSON.stringify(converted),
				dataType: "json"
			}).pipe(Server._formatFromServer);
		},
		addUser: function(user) {
			return $.ajax({
				url: 'authenticated-resources/user',
				contentType: 'application/json',
				type: 'POST',
				data: JSON.stringify(user),
				dataType: "json"
			});
		},
		deleteUser: function(userId) {
			return $.ajax({
				url: 'authenticated-resources/user/' + userId,
				contentType: 'application/json',
				type: 'DELETE',
				dataType: "json"
			});
		},
		getUsersAndPresents: function() {
			return $.getJSON('authenticated-resources/users-and-presents');
		}
	};
})();
