window.createViewModel = function() {
	function formatForServer(present) {
		var result = $.extend({}, present);
		result.to = parseInt(result.to);
		result.createdBy = parseInt(result.createdBy);
		result.offeredBy = parseInt(result.offeredBy);
		result.deletedBy = parseInt(result.deletedBy);
		return result;
	}

	function longToDate(long) {
		return !long ? null : new Date(long);
	}

	function formatFromServer(present) {
		var result = $.extend({}, present);
		result.creationDate = longToDate(result.creationDate);
		result.offeredDate = longToDate(result.offeredDate);
		return result;
	}

	var addPresent = function(present) {
		var converted = formatForServer(present);
		delete converted.id;
		return $.ajax({
			url: 'resources/present',
			contentType: 'application/json',
			type: 'POST',
			data: JSON.stringify(converted),
			dataType: "json"
		}).pipe(formatFromServer);
	};
	var editPresent = function(oldPresent, newPresent) {
		var converted = formatForServer(newPresent);
		return $.ajax({
			url: 'resources/present/' + oldPresent.id,
			contentType: 'application/json',
			type: 'PUT',
			data: JSON.stringify(converted),
			dataType: "json"
		}).pipe(formatFromServer);
	};

	return $.getJSON('resources/users-and-presents').pipe(function(usersAndPresents) {
		var users = usersAndPresents.users;
		var presents = usersAndPresents.presents;

		var viewModel = new ViewModel({
			confirm: function(t) {
				return confirm(t);
			},
			addPresentCommand: addPresent,
			editPresentCommand: editPresent,
			addUserCommand: addUser,
			deleteUserCommand: deleteUser
		});

		viewModel.presents(presents);
		viewModel.users(users);
		return viewModel;
	});
};
