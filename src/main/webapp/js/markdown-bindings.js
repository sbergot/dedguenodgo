ko.bindingHandlers.markdown = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	    var value = valueAccessor();
	    element.innerHTML = markdown.toHTML(value);
    }
};
ko.bindingHandlers.markdownEditor = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	    if (!ko.isObservable(valueAccessor())) {
		    throw new Error('binding should be writable');
	    }
	    $(element).change(function() {
		    valueAccessor()($(element).val());
	    })
	    .markdown();
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	    var value = ko.utils.unwrapObservable(valueAccessor());
	    $(element).val(value);
    }
};
