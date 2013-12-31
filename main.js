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
	this.selectedList = ko.observable('idElisa');
	this.presents = ko.observable([
		{
			id: "1",
			title: "Des mugs",
			description: "Des jolis mugs aux motifs africains",
			to: "idElisa",
			createdBy: "idElisa",
			creationDate: new Date(),
			offeredBy: "idOlivier",
			offeredDate: new Date(),
			deletedBy: null
		},
		{
			id: "2",
			title: "Le prix Goncourt",
			description: "C'est le \"serment de josette\" de Gaston Serpette aux édition boiron",
			to: "idElisa",
			createdBy: "idElisa",
			creationDate: new Date(),
			offeredBy: null,
			offeredDate: null,
			deletedBy: null
		}
	]);
	//present edition
	this.editing = ko.observable(false);
	this.editedPresent = ko.observable(null);
	this.edition = {
		title: ko.observable(),
		description: ko.observable()
	};
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
			if (p.deletedBy != null && p.to == loggedInUser) {return false;}
			if (p.to == loggedInUser && p.createdBy != loggedInUser) {return false;}
			return true;
		}).sort(function(a, b) {
			return self._comparePresents(a, b);
		});
	},
	/**Returns a string or null*/
	displayPresentAsOffered: function(present) {
		var loggedInUser = this.loggedInUser();
		if (present.offeredBy == null) {return null;}
		if (present.to == loggedInUser) {return null;}
	        return '(Offert par ' + this.users()[present.offeredBy].name + ')';
	},
	isEditedPresentModified: function() {
		var beforeModification = this._isCreating() ? {title: '', description: ''} : this.editedPresent();
		var hasChanges = false;
		if (this.edition.title() != beforeModification.title) {hasChanges = true;}
		if (this.edition.description() != beforeModification.description) {hasChanges = true;}
		return hasChanges;
	},
	editPresent: function(present) {
		this.editedPresent(present);
		this.edition.title(present.title);
		this.edition.description(present.description);
		this.editing(true);
	},
	cancelEdition: function() {
		if (this.isEditedPresentModified()) {
			var changeAnyways = confirm('Vous avez modifi\u00e9 ce cadeau. OK pour perdre vos modifications ?');
			if (!changeAnyways) {return;}
		}
		this.editing(false);
	},
	_isCreating: function() {
		return this.editedPresent() == null;
	},
	editPopupText: function() {
		return this._isCreating() ? 'Ajouter un cadeau' : 'Modifier ' + this.editedPresent().title;
	},
	_savePresent: function(present) {
		var presents = this.presents();
		var index = presents.indexOf(present);
		if (index == -1) {throw new Error('present not found');}
		this.presents([]);//force redisplay
		this.presents(presents);
	},
	togglePresentOffered: function(present) {
		if (!present.offeredBy) {
			present.offeredBy = this.loggedInUser();
			present.offeredDate = new Date();
		} else {
			if (present.offeredBy != this.loggedInUser()) {
				var offeredByName = this.users()[present.offeredBy].name;
				var ok = confirm("Ce cadeau a \u00e9t\u00e9 offert par " + offeredByName + ". Voulez-vous le marquer comme non encore offert ?");
				if (!ok) {return;}
			}
			present.offeredBy = null;
			present.offeredDate = null;
		}
		this._savePresent(present);
	},
	saveEditedPresent: function() {
		var title = this.edition.title();
		var description = this.edition.description();
		if (this._isCreating()) {
			var id = "tempId" + this.nextId++;
			var present = {
				id: id,
				title: title,
				description: description,
				to: this.selectedList(),
				createdBy: this.loggedInUser(),
				creationDate: new Date(),
				givenBy: null,
				givenDate: null,
				deletedBy: null
			};
			this.presents(this.presents().concat([present]));
		} else {
			var selected = this.editedPresent();
			selected.title = title;
			selected.description = description;
			this._savePresent(selected);
		}
		this.editing(false);
	},
	addPresent: function() {
		this.editedPresent(null);
		this.edition.title('');
		this.edition.description('');
		this.editing(true);
	},
	deletePresent: function(present) {
		if (present.createdBy != this.loggedInUser()) {
			var createdByName = this.users()[present.createdBy].name;
			var ok = confirm('Ce cadeau a \u00e9t\u00e9 cr\u00e9\u00e9 par ' + createdByName + '. Supprimer ?');
			if (!ok) {return;}
		}
		if (present.offeredBy != null) {
			present.deletedBy = this.loggedInUser();
			this._savePresent(present);
		} else {
			var presents = this.presents().filter(function(p) {
				return p.id != present.id;
			});
			this.presents(presents);
		}

	}

};
