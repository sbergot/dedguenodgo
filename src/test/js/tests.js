describe("The view model", function() { var viewModel;
	var throwIfConfirm, nextConfirmAnswer;
	var addPresentCall, addPresentDfd;
	var editPresentCall, editPresentDfd;

	beforeEach(function() {
		throwIfConfirm = true;
		nextConfirmAnswer = false;
		addPresentCall = null;
		addPresentDfd = null;
		editPresentCall = null;
		editPresentDfd = null;
		var confirm = function(text) {
			if (throwIfConfirm) {
				throw new Error('test triggered confirm but throwIfConfirm == true');
			}
			return nextConfirmAnswer;
		};
		var addPresentCommand = function(present) {
			addPresentCall = present;
			addPresentDfd = $.Deferred();
			return addPresentDfd.promise();
		};
		var editPresentCommand = function(present) {
			editPresentCall = present;
			editPresentDfd = $.Deferred();
			return editPresentDfd.promise();
		};
		viewModel = new ViewModel({
			confirm: confirm,
			addPresentCommand: addPresentCommand,
			editPresentCommand: editPresentCommand
		});
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
		viewModel.presents([{
			id: "1",
			title: "Gelatine rose",
			description: "Une matière gluante et fluo",
			to: "idElisa",
			createdBy: "idElisa",
			creationDate: new Date(),
			offeredBy: "idOlivier",
			givenDate: new Date(),
			deleted: false
		}, {
			id: "2",
			title: "Gelatine verte",
			description: "Une matière gluante et fluo",
			to: "idOlivier",
			createdBy: "idOlivier",
			creationDate: new Date(),
			offeredBy: null,
			givenDate: null,
			deleted: false
		}, {
			id: "3",
			title: "Gelatine jaune",
			description: "Une matière gluante et fluo",
			to: "idOlivier",
			createdBy: "idOlivier",
			creationDate: new Date(),
			offeredBy: "idNicolas",
			givenDate: new Date(),
			deleted: false
		}, {
			id: "4",
			title: "Gelatine rose",
			description: "Une matière gluante et fluo",
			to: "idOlivier",
			createdBy: "idNicolas",
			creationDate: new Date(),
			offeredBy: "idNicolas",
			givenDate: new Date(),
			deleted: false
		}, ]);
	});

	it("lists the users in the expected order", function() {
		expect(viewModel.lists().length).toEqual(Object.keys(viewModel.users()).length);
		expect(viewModel.lists().map(function(u) {
			return u.id;
		})).toEqual(['idOlivier', 'idElisa', 'idNicolas']);
	});

	it("lists the presents created by loggedInUser", function() {
		expect(viewModel.displayedPresents().map(function(p) {
			return p.id;
		})).toEqual(["2", "3"]);
	});

	it("displays the present as offered only when relevant", function() {
		expect(viewModel.displayPresentAsOffered(viewModel.presents()[2])).toEqual(null);
		viewModel.loggedInUser("idElisa");
		expect(viewModel.displayPresentAsOffered(viewModel.presents()[2])).not.toEqual(null);
		expect(viewModel.displayPresentAsOffered(viewModel.presents()[1])).toEqual(null);
	});

	it("can add present and select it when added", function() {
		var nbPresentsBefore = viewModel.presents().length;
		viewModel.addPresent();
		viewModel.edition.title("Gelatine grise");
		viewModel.saveEditedPresent();

		var presents = viewModel.presents();
		var last = presents[nbPresentsBefore];
		expect(last).not.toEqual(null);
		expect(last.to).toEqual(viewModel.selectedList());
		expect(last.createdBy).toEqual(viewModel.loggedInUser());
		expect(last.offeredBy).toEqual(null);
		expect(last.title).toEqual("Gelatine grise");

		//server call
		expect(viewModel.loadingMessage()).not.toEqual(null);
		addPresentDfd.resolve($.extend({}, last, {
			id: 'genratedId'
		}));
		expect(viewModel.presents()[nbPresentsBefore].title).toEqual('Gelatine grise');

	});

	it("can edit an existing present", function() {
		viewModel.editPresent(viewModel.presents()[0]);
		viewModel.edition.title('edited title');
		viewModel.saveEditedPresent();
		expect(viewModel.presents()[0].title).toEqual('edited title');
	});

	it("can toggle a present being offered", function() {
		viewModel.togglePresentOffered(viewModel.presents()[1]);
		expect(viewModel.presents()[1].offeredBy).toEqual(viewModel.loggedInUser());
		viewModel.togglePresentOffered(viewModel.presents()[1]);
		expect(viewModel.presents()[1].offeredBy).toEqual(null);
	});

	it("can delete a present", function() {
		viewModel.loggedInUser("idOlivier");
		expect(viewModel.displayedPresents().length).toEqual(2);

		//delete non offered
		viewModel.deletePresent(viewModel.presents()[2]);
		expect(viewModel.displayedPresents().length).toEqual(1);

		//delete offered
		viewModel.deletePresent(viewModel.presents()[1]);
		expect(viewModel.displayedPresents().length).toEqual(0);
	});

	it("hides deleted presents that are not offered", function() {
		viewModel.loggedInUser("idElisa");
		viewModel.selectedList('idOlivier');
		expect(viewModel.displayedPresents().length).toEqual(3);
		//delete non offered
		viewModel.loggedInUser("idOlivier");
		viewModel.deletePresent(viewModel.presents()[1]);
		viewModel.loggedInUser("idElisa");
		viewModel.selectedList('idOlivier');
		expect(viewModel.displayedPresents().length).toEqual(2);

		//delete offered
		viewModel.loggedInUser("idOlivier");
		viewModel.deletePresent(viewModel.presents()[2]);
		viewModel.loggedInUser("idElisa");
		viewModel.selectedList('idOlivier');
		expect(viewModel.displayedPresents().length).toEqual(2);
	});


	it("let a user mark a present offered in his list event when already offered", function() {
		viewModel.togglePresentOffered(viewModel.presents()[2]);
		expect(viewModel.presents()[2].offeredBy).toEqual('idOlivier');
	});
});
