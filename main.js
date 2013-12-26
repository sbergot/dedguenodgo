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
	this.presents = ko.observable({
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
	this.selectedPresent = ko.observable(null);
}

ViewModel.prototype = {
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
	}
};
