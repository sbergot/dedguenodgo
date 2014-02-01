$(document).ready(function() {
	var mockServerLoaded = !/demo/.test(location.search) ? $.when() : $.getScript('js/localstorage-model.js');
	$.when(mockServerLoaded).fail(function(viewModel) {
		$("body").html('error').css('color', 'red');
	}).done(function() {
		window.server = new Server();
		window.viewModel = new ViewModel({
			server: server,
			confirm: function(t) {
				return confirm(t);
			},
			prompt: function(t) {
				return prompt(t);
			}
		});
		ko.applyBindings(window.viewModel);
	});
});
