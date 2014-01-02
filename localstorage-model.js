window.createLocalStorageModel = function() {
	function load(id) {
		try {
			var json = localStorage.getItem(id);
			if (!json) {return null;}
			return JSON.parse(json);
		} catch (e) {
			console.log(e);
			return null;
		}
	}
	function save(id, value) {
		return localStorage.setItem(id, JSON.stringify(value));
	}
	if (!load('users')) {
		save('users', {
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
	if (!load('presents')) {
		save('presents', [{
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
		}
		]);
	}

	function makeFakeAsync(syncFunc) {
		return function() {
			var args = arguments;
			var dfd = $.Deferred();
			setTimeout(function() {
				var result = syncFunc.apply(null, args);
				dfd.resolve(result);
			}, Math.random() < 0.4 ? 2500 : 100);
			return dfd.promise();
		};
	}
	function loadPresents() {
		var presents = load('presents');
		if (!presents) {return null;}
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
	}
	var addPresent = function(newPresent) {
		var presents = loadPresents();
		var ids = {};
		for (var i = 0; i < presents.length; i++) {
			ids[presents[i].id] = true;
		}
		while(!newPresent.id || ids[newPresent.id]) {
			newPresent.id = 'randomId' + Math.random();
		}
		presents.push(newPresent);
		save('presents', presents);
		return newPresent;
	};
	var editPresent = function(oldPresent, newPresent) {
		var presents = loadPresents();
		var matching = [];
		for (var i = 0; i < presents.length; i++) {
			if(presents[i].id == oldPresent.id) {
				matching.push(i);
			}
		}
		if (matching.length !== 1) {
			throw new Error('expected 1 item for id ' + oldPresent.id);
		}
		$.extend(presents[matching[0]], newPresent);
		save('presents', presents);
		return presents[matching[0]];
	};
	var viewModel = new ViewModel(function(t) {return confirm(t);}, makeFakeAsync(addPresent), makeFakeAsync(editPresent));
	viewModel.presents(loadPresents());
	return viewModel;
};
