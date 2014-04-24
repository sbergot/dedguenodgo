ko.bindingHandlers.markdown = {
	init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {},
	update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
		var value = ko.utils.unwrapObservable(valueAccessor());
		element.innerHTML = markdown.toHTML(value);
	}
};
ko.bindingHandlers.markdownEditor = {
	init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
		ko.bindingHandlers.value.init(element, valueAccessor, allBindings, viewModel, bindingContext);
		$(element).markdown({
			onFocus: function() {
				//buttons call onFocus
				//It is the only way I have found to notify the view model
				$(element).change();
			}
		});
	},
	update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
		ko.bindingHandlers.value.update(element, valueAccessor, allBindings, viewModel, bindingContext);
	}
};
