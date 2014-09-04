(function() {
	window.LoginViewModel = function(options) {
		var self = this;

		this._server = options.server;
		this._loginCallback = options.loginCallback;

		this.partyId = createStorageObservable(localStorage, 'partyId');
		this.partyPassword = createStorageObservable(sessionStorage, 'partyPassword');
		this.user = ko.observable();
		this.users = ko.observable(null);
		this.sortedUsers = ko.computed(function() {
			var unsorted = self.users(); 
			return !unsorted ? null : unsorted.sort(function(a, b) {
				return a.name < b.name ? -1 : 1;
			});
		});

		this.partyLoading = ko.observable(false);
		this.partyError = ko.observable(false);
		this.partyOk = ko.computed(function() {
			return self.users() !== null;
		});
		this.userActionLoading = ko.observable(false);
		this.userActionError = ko.observable(false);
		this.userActionOk = ko.observable(false);

		this.partyId.subscribe(function() {
			self.users(null);
		});
		this.partyPassword.subscribe(function() {
			self.users(null);
		});
		//hide userAction result when selecting a new user
		this.user.subscribe(function(value) {
			//if deleting value will become null
			//and we want to keep action result on display
			if (!value) {return;}
			self.userActionError(false);
			self.userActionOk(false);
		});

		//persist selected user in localStorage
		this.user.subscribe(function(value) {
			if (value) {
				localStorage.setItem('userId', value.id);
			}
		});
		//restore selected user from localStorage
		this.users.subscribe(function(users) {
			if (!users) {return;}
			var storedId = localStorage.getItem('userId');
			var storedUser = users.filter(function(u) {
				return u.id == storedId;
			});
			if (storedUser.length === 1) {
				//setTimeout necessary to avoid knockout setting it to null
				setTimeout(function() {
					if (!self.user()) {
						self.user(storedUser[0]);
					}
				}, 0);
			}
		});
	};

	window.LoginViewModel.prototype = {
		submitParty: function() {
			var self = this;
			this.partyLoading(true);
			this.partyError(false);
			this._server.getPartyUsers({
				id: this.partyId(),
				password: this.partyPassword()
			}).always(function() {
				self.partyLoading(false);
			}).fail(function() {
				self.partyError(true);
			}).done(function(users) {
				if (!users) {
					self.partyError(true);
					return; 
				}
				self.users(users);
				//needed for user edition commands
				self._loginCallback({
					partyId: self.partyId(),
					partyPassword: self.partyPassword()
				});
			});
		},
		submitUser: function() {
			if (!this.user()) {
				return;
			}
			this._loginCallback({
				partyId: this.partyId(),
				partyPassword: this.partyPassword(),
				userId: this.user().id
			});
		},
		addUser: function() {
			var name = prompt('Nom du nouvel utilisateur');
			if (!name) {
				return;
			}
			var ok = confirm('Cr\u00e9er l\'utilisateur "' + name + '"?');
			if (!ok) {
				return;
			}
			var self = this;
			this.userActionError(false);
			this.userActionOk(false);
			this.userActionLoading(true);
			this._server.addUser({
				name: name
			}).always(function() {
				self.userActionLoading(false);
			}).fail(function(error) {
				console.error(error);
				self.userActionError(true);
			}).done(function(user) {
				self.userActionOk(true);
				self.users(self.users().concat([user]));
			});
		},
		deleteUser: function() {
			var user = this.user();
			var ok = confirm('Supprimer ' + user.name + '?');
			if (!ok) {
				return;
			}
			ok = confirm('Cette suppression de "' + user.name + '" sera irréversible !');
			if (!ok) {
				return;
			}
			var self = this;
			this.userActionError(false);
			this.userActionOk(false);
			this.userActionLoading(true);
			this._server.deleteUser(user.id).always(function() {
				self.userActionLoading(false);
			}).fail(function(error) {
				console.error(error);
				self.userActionError(true);
			}).done(function() {
				self.userActionOk(true);
				self.users(self.users().filter(function(u) {
					return u != user;
				}));
			});
		}
	};
})();
