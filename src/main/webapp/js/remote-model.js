window.createViewModel = function() {
	var addPresent = null;
	var editPresent = null;
	var viewModel = new ViewModel(function(t) {
		return confirm(t);
	}, addPresent, editPresent);

	viewModel.presents([]);
	viewModel.users({});
	return viewModel;
};
