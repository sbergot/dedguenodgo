describe("The view model", function() {
	var viewModel;

	beforeEach(function() {
		viewModel = new ViewModel();
		viewModel.users = ko.observable({
			'idNicolas': {
				id: 'idNicolas',
				name: 'Nicolas'
			},
			'idOlivier': {
				id: 'idOlivier',
				name: 'Olivier'
			},
			'idElisa': {
				id: 'idElisa',
				name: 'Elisa'
			},
		});
		viewModel.loggedInUser = ko.observable('idOlivier');
		viewModel.selectedList = ko.observable('idOlivier');
		viewModel.presents = ko.observable({
			"1": {
				title: "Gelatine rose",
				description: "Une matière gluante et fluo",
				to: "idElisa",
				createdBy: "idElisa",
				creationDate: new Date(),
				givenBy: "idOlivier",
				deleted: false,
				givenDate: new Date()
			}
		});
		viewModel.selectedPresent = ko.observable(null);
	});

	it("lists the users in the expected order", function() {
		expect(viewModel.lists().length).toEqual(Object.keys(viewModel.users()).length);
		expect(viewModel.lists().map(function(u){return u.id;})).toEqual(['idOlivier', 'idElisa', 'idNicolas']);
	});
});
