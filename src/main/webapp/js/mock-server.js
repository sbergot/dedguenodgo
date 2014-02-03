(function() {
	var MockFailedServerCall = function(message) {
		this.message = message;
	};
	window.Server = function() {
		this.login = null;

		if (!this._load('users')) {
			this._save('users', {
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
		}
		if (!this._load('presents')) {
			this._save('presents', [{
				id: "1",
				title: "Des mugs",
				description: "Des jolis mugs aux motifs africains",
				to: "idElisa",
				createdBy: "idElisa",
				creationDate: new Date(),
				offeredBy: "idOlivier",
				offeredDate: new Date(),
				deletedBy: null
			}, {
				id: "2",
				title: "Le prix Goncourt",
				description: "C'est le \"serment de josette\" de Gaston Serpette aux édition boiron",
				to: "idElisa",
				createdBy: "idElisa",
				creationDate: new Date(),
				offeredBy: null,
				offeredDate: null,
				deletedBy: null
			}]);
		}
	};
	window.Server.prototype = {
		setLogin: function(login) {
			this.login = login;
		},
		_getPartyUsers: function(credentials) {
			if (credentials.id == 'demo' && credentials.password == 'demo') {
				var users = this._loadUsers();
				return Object.keys(users).map(function(k) {
					return users[k];
				});	
			} else {
				return null;
			}
		},
		_load: function(id) {
			try {
				var json = localStorage.getItem(id);
				if (!json) {
					return null;
				}
				return JSON.parse(json);
			} catch (e) {
				console.log(e);
				return null;
			}
		},

		_save: function(id, value) {
			return localStorage.setItem(id, JSON.stringify(value));
		},


		_loadPresents: function() {
			var presents = this._load('presents');
			if (!presents) {
				return null;
			}
			var dateProperties = ['creationDate', 'offeredDate'];
			for (var i = 0; i < presents.length; i++) {
				var p = presents[i];
				for (var j = 0; j < dateProperties.length; j++) {
					var dateProp = dateProperties[j];
					if (p[dateProp]) {
						p[dateProp] = new Date(p[dateProp]);
					}
				}
			}
			return presents;
		},
		_loadUsers: function() {
			return this._load('users');
		},
		_addUser: function(user) {
			var id = 'user' + Math.random();
			user.id = id;
			var users = this._loadUsers();
			users[id] = user;
			this._save('users', users);
			return user;
		},
		_deleteUser: function(id) {
			var users = this._loadUsers();
			delete users[id];
			this._save('users', users);
		},
		_addPresent: function(newPresent) {
			var presents = this._loadPresents();
			var ids = {};
			for (var i = 0; i < presents.length; i++) {
				ids[presents[i].id] = true;
			}
			while (!newPresent.id || ids[newPresent.id]) {
				newPresent.id = 'randomId' + Math.random();
			}
			presents.push(newPresent);
			this._save('presents', presents);
			return newPresent;
		},
		_editPresent: function(oldPresent, newPresent) {
			var presents = this._loadPresents();
			var matching = [];
			for (var i = 0; i < presents.length; i++) {
				if (presents[i].id == oldPresent.id) {
					matching.push(i);
				}
			}
			if (matching.length !== 1) {
				throw new Error('expected 1 item for id ' + oldPresent.id);
			}
			$.extend(presents[matching[0]], newPresent);
			this._save('presents', presents);
			return presents[matching[0]];
		},
		_getUsersAndPresents: function() {
			return {
				users: this._loadUsers(),
				presents: this._loadPresents()
			};
		}
	};
	var functionNames = ['addPresent', 'editPresent', 'addUser', 'deleteUser', 'getUsersAndPresents', 'getPartyUsers'];
	function makeAsync(syncFuncName) {
		return function() {
			var self = this;
			var args = arguments;
			var dfd = $.Deferred();
			setTimeout(function() {
				var result = self[syncFuncName].apply(self, args);
				if (result instanceof MockFailedServerCall) {
					dfd.reject(result.message);
				} else {
					dfd.resolve(result);
				}
			}, Math.random() < 0.4 ? 2500 : 100);
			return dfd.promise();
		};
	}
	for (var i = 0; i < functionNames.length; i++) {
		var funcName = functionNames[i];
		window.Server.prototype[funcName] = makeAsync('_' + funcName);
	}

})();
