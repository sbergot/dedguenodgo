window.ViewModel = function() {
	this.partyId = ko.observable();
	this.partyPassword = ko.observable();
	this.userId = ko.observable();
	this.loadingParty = ko.observable(false);
	this.partyOk = ko.observable(false);
	this.loadingUser = ko.observable(false);
	this.userOk = ko.observable(false);

};

window.ViewModel.prototype = {
	submit: function() {},
	addUser: function() {},
	deleteUser: function() {}
};

