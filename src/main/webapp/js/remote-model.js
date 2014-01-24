window.createViewModel = function() {
	var convertPresent = function(present) {
		var result = $.extend({}, present);
		result.to = parseInt(result.to);
		result.createdBy = parseInt(result.createdBy);
		result.offeredBy = parseInt(result.offeredBy);
		result.deletedBy = parseInt(result.deletedBy);
		return result;
	};
	
	var addPresent = function(present) {
		var converted = convertPresent(present);
		delete converted.id;
		return $.ajax({
			url: 'resources/present',
			contentType: 'application/json',
			type: 'POST',
			data: JSON.stringify(converted),
			dataType: "json"
		});
	};
	var editPresent = function(oldPresent, newPresent) {
		var converted = convertPresent(newPresent);
		return $.ajax({
			url: 'resources/present/' + oldPresent.id,
			contentType: 'application/json',
			type: 'PUT',
			data: JSON.stringify(converted),
			dataType: "json"
		});
	};
	
	return $.when($.getJSON('resources/user'), $.getJSON('resources/present')).pipe(function(usersJQ, presentsJQ) {
		var users = usersJQ[0];
		var presents = presentsJQ[0];
		
		var viewModel = new ViewModel(function(t) {
			return confirm(t);
		}, addPresent, editPresent);
		
		viewModel.presents(presents);
		viewModel.users(users);
		return viewModel;
	});
};
