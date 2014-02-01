(function() {
	window.Server = function() {
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
				users: {
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
				},
				presents: this._loadPresents()
			};
		}
	};
	var functionNames = ['addPresent', 'editPresent', 'addUser', 'deleteUser', 'getUsersAndPresents'];
	function makeAsync(syncFuncName) {
		return function() {
			var self = this;
			var args = arguments;
			var dfd = $.Deferred();
			setTimeout(function() {
				var result = self[syncFuncName].apply(self, args);
				dfd.resolve(result);
			}, Math.random() < 0.4 ? 2500 : 100);
			return dfd.promise();
		};
	}
	for (var i = 0; i < functionNames.length; i++) {
		var funcName = functionNames[i];
		window.Server.prototype[funcName] = makeAsync('_' + funcName);
	}

})();
