console.log('ok');
function ViewModel() {
	this.users = ko.observable({
		'idOlivier': {
			name: 'Olivier'
		},
		'idElisa': {
			name: 'Elisa'
		},
		'idNicolas': {
			name: 'Nicolas'
		}
	});
	this.loggedInUser = ko.observable('idOlivier');
	this.selectedList = ko.observable('idOlivier');
	this.presents = ko.observableArray([
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
	this.selectedPresent = ko.observable(null);
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
		return b.creationDate.getTime() - a.creationDate.getTime();
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
	addPresent: function(title) {
		var id = "tempId" + this.nextId++;
		this.presents.push({
			id: id,
			title: title,
			description: "",
			to: this.selectedList(),
			createdBy: this.loggedInUser(),
			creationDate: new Date(),
			givenBy: null,
			givenDate: null,
			deleted: false
		});
		this.selectedPresent(id);
	}

};
