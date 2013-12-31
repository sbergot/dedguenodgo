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
			offeredBy: "idOlivier",
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
			offeredBy: null,
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
			offeredBy: "idNicolas",
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

	it("displays the present as offered only when relevant", function() {
		expect(viewModel.displayPresentAsOffered(viewModel.presents()[2])).toEqual(false);
		viewModel.loggedInUser("idElisa");
		expect(viewModel.displayPresentAsOffered(viewModel.presents()[2])).toEqual(true);
		expect(viewModel.displayPresentAsOffered(viewModel.presents()[1])).toEqual(false);
	});

	it("can add present and select it when added", function() {
		viewModel.newPresentTitle("Gelatine grise");
		viewModel.addPresent();
		var selected = viewModel.selectedPresent();
		expect(selected).not.toEqual(null);
		expect(selected.to).toEqual(viewModel.selectedList());
		expect(selected.createdBy).toEqual(viewModel.loggedInUser());
		expect(selected.offeredBy).toEqual(null);
		expect(selected.title).toEqual("Gelatine grise");
	});
	
	it("can edit an existing present", function() {
		viewModel.selectedPresent(viewModel.presents()[0]);
		viewModel.selectedPresentEdits.title('edited title');
		viewModel.saveSelectedPresent();
		expect(viewModel.presents()[0].title).toEqual('edited title');
	});

	it("can toggle a present being offered", function() {
		viewModel.togglePresentOffered(viewModel.presents()[1]);
		expect(viewModel.presents()[1].offeredBy).toEqual(viewModel.loggedInUser());
		viewModel.togglePresentOffered(viewModel.presents()[1]);
		expect(viewModel.presents()[1].offeredBy).toEqual(null);
	});

});
