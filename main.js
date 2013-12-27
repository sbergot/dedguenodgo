function ViewModel() {
	this.users = ko.observable({
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
	this.loggedInUser = ko.observable('idOlivier');
	this.selectedList = ko.observable('idOlivier');
	this.presents = ko.observable([
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
		}
	]);
	this.presents.extend({notify: 'always'});
	this.selectedPresent = ko.observable(null);
	this.selectedPresentEdits = {
		title: ko.observable(),
		description: ko.observable()
	};
	this.newPresentTitle = ko.observable();
}

ViewModel.prototype = {
	nextId: 1,
	lists: function() {
		var users = this.users();
		var loggedInUser = this.loggedInUser();
		var ids = Object.keys(users);
		ids.sort(function(a, b) {
			if (a === loggedInUser) {return -1;}
			if (b === loggedInUser) {return 1;}
			return users[a].name < users[b].name ? -1 : 1;
		});
		return ids.map(function(id) {return users[id];});
	},
	_comparePresents: function(a, b) {
		return a.creationDate.getTime() - b.creationDate.getTime();
	},
	displayedPresents: function() {
		var selectedList = this.selectedList();
		var loggedInUser = this.loggedInUser();
		var self = this;
		return this.presents().filter(function(p) {
			if (p.to != selectedList) {return false;}
			if (p.deleted == true && p.to == loggedInUser) {return false;}
			if (p.to == loggedInUser && p.createdBy != loggedInUser) {return false;}
			return true;
		}).sort(function(a, b) {
			return self._comparePresents(a, b);
		});
	},
	displayPresentAsGiven: function(present) {
		var loggedInUser = this.loggedInUser();
		return present.to != loggedInUser && present.givenBy != null;
	},
	isSelectedPresentModified: function() {
		var hasChanges = false;
		if (this.selectedPresent() != null && this.selectedPresentEdits.title() != this.selectedPresent().title) {hasChanges = true;}
		if (this.selectedPresent() != null && this.selectedPresentEdits.description() != this.selectedPresent().description) {hasChanges = true;}
		return hasChanges;
	},
	selectPresent: function(present) {
		if (this.isSelectedPresentModified()) {
			var changeAnyways = confirm('Vous avez modifi\u00e9 ce cadeau. Annuler vos changements ?');
			if (!changeAnyways) {return;}
		}
		this.selectedPresent(present);
		this.selectedPresentEdits.title(present.title);
		this.selectedPresentEdits.description(present.description);
	},
	saveSelectedPresent: function() {
		var presents = this.presents();
		var selected = this.selectedPresent();
		var index = presents.indexOf(selected);
		if (index == -1) {throw new Error('selected present not found');}
		selected.title = this.selectedPresentEdits.title();
		selected.description = this.selectedPresentEdits.description();
		this.presents(presents);
	},
	addPresent: function() {
		var title = this.newPresentTitle();
		var id = "tempId" + this.nextId++;
		var present = {
			id: id,
			title: title,
			description: "",
			to: this.selectedList(),
			createdBy: this.loggedInUser(),
			creationDate: new Date(),
			givenBy: null,
			givenDate: null,
			deleted: false
		};
		var newPresents = this.presents();
		newPresents.push(present);
		this.presents(newPresents);
		this.selectPresent(present);
		this.newPresentTitle('');
	}

};
