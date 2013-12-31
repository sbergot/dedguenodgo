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
			offeredBy: "idOlivier",
			offeredDate: new Date(),
			deleted: false
		}
	]);
	this.selectedPresent = ko.observable(null);
	this.selectedPresentEdits = {
		title: ko.observable(),
		description: ko.observable()
	};
	this.newPresentTitle = ko.observable();
}

ViewModel.prototype = {
	nextId: 1,
	vowels: {a: true, e: true, i: true, o: true, u: true, y: true},
	lists: function() {
		var users = this.users();
		var loggedInUser = this.loggedInUser();
		var ids = Object.keys(users);
		ids.sort(function(a, b) {
			if (a === loggedInUser) {return -1;}
			if (b === loggedInUser) {return 1;}
			return users[a].name < users[b].name ? -1 : 1;
		});
		return ids.map(function(id) {
			var userName = users[id].name;
			var beginByVowel = ViewModel.prototype.vowels[userName.slice(0,1).toLowerCase()];
			var label = 'Liste ' + (beginByVowel ? "d'" : "de ") + userName;
			return {id: id, label: label};
		});
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
	displayPresentAsOffered: function(present) {
		var loggedInUser = this.loggedInUser();
		return present.to != loggedInUser && present.offeredBy != null;
	},
	isSelectedPresentModified: function() {
		var hasChanges = false;
		if (this.selectedPresent() != null && this.selectedPresentEdits.title() != this.selectedPresent().title) {hasChanges = true;}
		if (this.selectedPresent() != null && this.selectedPresentEdits.description() != this.selectedPresent().description) {hasChanges = true;}
		return hasChanges;
	},
	isPresentSelected: function(present) {
		return this.selectedPresent() === present;
	},
	selectPresent: function(present) {
		if (this.isPresentSelected(present)) {return;}
		if (this.isSelectedPresentModified()) {
			var changeAnyways = confirm('Vous avez modifi\u00e9 ce cadeau. Annuler vos changements ?');
			if (!changeAnyways) {return;}
		}
		this.selectedPresent(present);
		if (present) {
			this.selectedPresentEdits.title(present.title);
			this.selectedPresentEdits.description(present.description);
		}
	},
	_savePresent: function(present) {
		var presents = this.presents();
		var index = presents.indexOf(present);
		if (index == -1) {throw new Error('present not found');}
		this.presents([]);//force redisplay
		this.presents(presents);
	},
	saveSelectedPresent: function() {
		var selected = this.selectedPresent();
		selected.title = this.selectedPresentEdits.title();
		selected.description = this.selectedPresentEdits.description();
		this._savePresent(selected);
		this.selectPresent(null);
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
			offeredBy: null,
			offeredDate: null,
			deleted: false
		};
		var newPresents = this.presents();
		newPresents.push(present);
		this.presents(newPresents);
		this.selectPresent(present);
		this.newPresentTitle('');
	},
	togglePresentOffered: function(present) {
		if (!present.offeredBy) {
			present.offeredBy = this.loggedInUser();
			present.offeredDate = new Date();
		} else {
			if (present.offeredBy != this.loggedInUser()) {
				var offeredByName = this.users()[present.offeredBy].name;
				var ok = confirm("Ce cadeau a \u00e9t\u00e9 offert par " + offeredByName + ". Voulez-vous malgr\u00e9 tout le marquer comme n'\00e9tant pas encore offert ?");
				if (!ok) {return;}
			}
			present.offeredBy = null;
			present.offeredDate = null;
		}
		this._savePresent(present);
	}

};
