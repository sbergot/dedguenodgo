window.createViewModel = function() {
	var addPresent = null;
	var editPresent = null;
	
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
