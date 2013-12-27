describe("The view model", function() {
	var viewModel;

	beforeEach(function() {
		viewModel = new ViewModel();
		viewModel.users({
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
		viewModel.loggedInUser('idOlivier');
		viewModel.selectedList('idOlivier');
		viewModel.presents([
			{
			id: "1",
			title: "Gelatine rose",
			description: "Une matière gluante et fluo",
			to: "idElisa",
			createdBy: "idElisa",
			creationDate: new Date(),
			givenBy: "idOlivier",
			givenDate: new Date(),
			deleted: false
			},
			{
			id: "2",
			title: "Gelatine verte",
			description: "Une matière gluante et fluo",
			to: "idOlivier",
			createdBy: "idElisa",
			creationDate: new Date(),
			givenBy: null,
			givenDate: null,
			deleted: false
			},
			{
			id: "3",
			title: "Gelatine jaune",
			description: "Une matière gluante et fluo",
			to: "idOlivier",
			createdBy: "idOlivier",
			creationDate: new Date(),
			givenBy: "idNicolas",
			givenDate: new Date(),
			deleted: false
			},
		]);
		viewModel.selectedPresent(null);
	});

	it("lists the users in the expected order", function() {
		expect(viewModel.lists().length).toEqual(Object.keys(viewModel.users()).length);
		expect(viewModel.lists().map(function(u){return u.id;})).toEqual(['idOlivier', 'idElisa', 'idNicolas']);
	});

	it("lists the presents created by loggedInUser", function() {
		expect(viewModel.displayedPresents().map(function(p){
			return p.id;
		})).toEqual(["3"]);
	});

	it("displays the present as given only when relevant", function() {
		expect(viewModel.displayPresentAsGiven(viewModel.presents()[2])).toEqual(false);
		viewModel.loggedInUser("idElisa");
		expect(viewModel.displayPresentAsGiven(viewModel.presents()[2])).toEqual(true);
		expect(viewModel.displayPresentAsGiven(viewModel.presents()[1])).toEqual(false);
	});

	it("can add present and select it when added", function() {
		viewModel.newPresentTitle("Gelatine grise");
		viewModel.addPresent();
		var id = viewModel.selectedPresent();
		expect(id).not.toEqual(null);
		var added = viewModel.presents().filter(function(p){return p.id == id;})[0];
		expect(added.to).toEqual(viewModel.selectedList());
		expect(added.createdBy).toEqual(viewModel.loggedInUser());
		expect(added.givenBy).toEqual(null);
		expect(added.title).toEqual("Gelatine grise");
	});
});
