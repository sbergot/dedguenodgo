function AppViewModel(options) {
    this.confirm = options.confirm;
    this.prompt = options.prompt;
    this.server = options.server;
    this.logoutCallback = options.logoutCallback;

    this.managing = ko.observable(false);
    this.selectedMParty = ko.observable(0);
    this.parties = ko.observableArray([]);
    this.users = ko.observable({});
    this.mPartyUsers = ko.observable([]);
    this.loggedInUser = createStorageObservable(sessionStorage, 'loggedInUser');
    var self = this;
    this.selectedList = ko.observable();
    //select own list by default
    this.loggedInUser.subscribe(function(value) {
        self.selectedList(value);
    });
    this.presents = ko.observable([]);
    //present edition
    this.editing = ko.observable(false);
    this.editedPresent = ko.observable(null);
    this.edition = {
        title: ko.observable(),
        description: ko.observable()
    };
    this.successMessage = ko.observable();
    this.errorMessage = ko.observable();
    this.undoAction = ko.observable();
    this.loadingMessage = ko.observable(null);

    this.initLoading = ko.observable();
    this.initError = ko.observable();

    var throttledHasLoading = ko.computed(function() {
        return self.loadingMessage() !== null;
    }).extend({
        throttle: 400
    });
    //display null immediatly but wait a few ms before displaying non null
    this.slowShowingLoadingMessage = ko.computed(function() {
        var loadingMessage = self.loadingMessage();
        var hasLoading = throttledHasLoading();
        return hasLoading ? loadingMessage : null;
    });

    this.loggedInUser.subscribe(function() {
        self.discardConfirm();
    });
    this.selectedList.subscribe(function() {
        self.discardConfirm();
    });

    if (options.initOnStartup) {
        this.init();
    }
}

AppViewModel.prototype = {
    nextId: 1,
    init: function() {
        var self = this;
        this.initLoading(true);
        return this.server.getPartiesAndUsersAndPresents().always(function() {
            self.initLoading(false);
        }).fail(function() {
            self.initError(true);
        }).done(function(pAndU) {
            self.parties(pAndU.parties);
            self.users(entitiesToMap(pAndU.users, 'name'));
            var musers = pAndU.users.map(function(e) {
                return {
                    selected:ko.observable(false),
                    name:e.name
                };
            });
            self.mPartyUsers(musers);
            self.presents(pAndU.presents);
        });
    },
    vowels: {
        a: true,
        e: true,
        i: true,
        o: true,
        u: true,
        y: true
    },
    lists: function() {
        var users = this.users();
        var loggedInUser = this.loggedInUser();
        var ids = Object.keys(users);
        ids.sort(function(a, b) {
            if (a === loggedInUser) {
                return -1;
            }
            if (b === loggedInUser) {
                return 1;
            }
            return users[a].name < users[b].name ? -1 : 1;
        });
        return ids.map(function(id) {
            var userName = users[id].name;
            var beginByVowel = AppViewModel.prototype.vowels[userName.slice(0, 1).toLowerCase()];
            var label = 'Liste ' + (beginByVowel ? "d'" : "de ") + userName;
            return {
                id: id,
                label: label
            };
        });
    },
    getUserName: function(userId) {
        var user = this.users()[userId];
        return !user ? 'utilisateur supprimé' : user.name;
    },
    logout: function() {
        this.logoutCallback();
    },
    _comparePresents: function(a, b) {
        return a.creationDate.getTime() - b.creationDate.getTime();
    },
    displayedPresents: function() {
        var selectedList = this.selectedList();
        var loggedInUser = this.loggedInUser();
        var self = this;
        return this.presents().filter(function(p) {
            if (p.to != selectedList) {
                return false;
            }
            if (p.deletedBy && !self.displayPresentAsOffered(p)) {
                return false;
            }
            if (p.to == loggedInUser && p.createdBy != loggedInUser) {
                return false;
            }
            return true;
        }).sort(function(a, b) {
            return self._comparePresents(a, b);
        });
    },
    /**Returns a string or null*/
    displayPresentAsOffered: function(present) {
        var loggedInUser = this.loggedInUser();
        if (!present.offeredBy) {
            return null;
        }
        if (present.to == loggedInUser && present.offeredBy != loggedInUser) {
            return null;
        }
        var username = this.getUserName(present.offeredBy);
        return '(rayé par ' + username + ')';
    },
    /**Returns a string or null*/
    displayPresentAsCreatedBy: function(present) {
        return (present.to === present.createdBy) ? null : '(ajouté par ' + this.getUserName(present.createdBy) + ')';
    },
    isEditedPresentModified: function() {
        var beforeModification = this._isCreating() ? {
            title: '',
            description: ''
        } : this.editedPresent();
        var hasChanges = false;
        if (this.edition.title() != beforeModification.title) {
            hasChanges = true;
        }
        if (this.edition.description() != beforeModification.description) {
            hasChanges = true;
        }
        return hasChanges;
    },
    editPresent: function(present) {
        this.discardConfirm();
        this.editedPresent(present);
        this.edition.title(present.title);
        this.edition.description(present.description);
        this.editing(true);
    },
    cancelEdition: function() {
        if (this.isEditedPresentModified()) {
            var changeAnyways = this.confirm('Vous avez modifi\u00e9 ce cadeau. OK pour perdre vos modifications ?');
            if (!changeAnyways) {
                return;
            }
        }
        this.editing(false);
    },
    _isCreating: function() {
        return this.editedPresent() === null;
    },
    editPopupText: function() {
        return this._isCreating() ? 'Ajouter un cadeau' : 'Modifier ' + this.editedPresent().title;
    },
    _addPresent: function(present) {
        this.presents(this.presents().concat([present]));
        this.loadingMessage('Ajout de "' + present.title + '" en cours...');
        var self = this;
        this.server.addPresent(present)
            .always(function() {
                self.loadingMessage(null);
            })
            .fail(function() {
                self.errorMessage('Erreur pendant la sauvegarde de ' + present.title);
                var presents = self.presents();
                var index = presents.indexOf(present);
                presents.splice(index, 1);
                self.presents(presents);
            }).done(function() {
                self.init().done(function () {
                    self.successMessage('"' + present.title + '" a bien été créé');
                    // we should be looking for the index, but it was created by the server
                    // so we look for the title
                    var newPresent = self.presents().find(function(e) { return e.title === present.title; });
                    self.undoAction(function() {
                        self.deletePresent(newPresent, true);
                    });
                });
            });
    },
    _savePresent: function(oldPresent, newPresent, hideUndo) {
        var presents = this.presents();
        var index = presents.findIndex(function(e) { return e.id === oldPresent.id; });
        if (index == -1) {
            throw new Error('present not found');
        }
        presents[index] = newPresent;
        //        this.presents([]); //force redisplay
        this.presents(presents);
        this.discardConfirm();
        this.loadingMessage('Modification de "' + newPresent.title + '" en cours...');
        var self = this;
        this.server.editPresent(oldPresent, newPresent)
            .always(function() {
                self.loadingMessage(null);
            })
            .fail(function() {
                self.errorMessage('Erreur pendant la sauvegarde de ' + newPresent.title);
                var presents = self.presents();
                var index = presents.indexOf(newPresent);
                if (index == -1) {
                    throw new Error('present not found');
                }
                presents[index] = oldPresent;
                //        this.presents([]); //force redisplay
                self.presents(presents);
            }).done(function() {
                self.init().done(function () {
                    if (!hideUndo) {
                        self.successMessage('"' + newPresent.title + '" a bien été modifié');
                        self.undoAction(function() {
                            self._savePresent(newPresent, oldPresent, true);
                        });
                    }
                });
            });
    },
    togglePresentOffered: function(present) {
        this.discardConfirm();
        var clone = $.extend({}, present);
        if (!this.displayPresentAsOffered(present)) {
            clone.offeredBy = this.loggedInUser();
            clone.offeredDate = new Date();
        } else {
            if (present.offeredBy != this.loggedInUser()) {
                var offeredByName = this.getUserName(present.offeredBy);
                var ok = this.confirm("Ce cadeau a \u00e9t\u00e9 ray\u00e9 par " + offeredByName + ". Voulez-vous le d\u00e9-rayer ?");
                if (!ok) {
                    return;
                }
            }
            clone.offeredBy = null;
            clone.offeredDate = null;
        }
        this._savePresent(present, clone);
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
                offeredBy: null,
                offeredDate: null,
                deletedBy: null
            };
            this._addPresent(present);
        } else {
            var selected = this.editedPresent();
            var clone = $.extend({}, selected);
            clone.title = title;
            clone.description = description;
            this._savePresent(selected, clone);
        }
        this.editing(false);
    },
    addPresent: function() {
        this.discardConfirm();
        this.editedPresent(null);
        this.edition.title('');
        this.edition.description('');
        this.editing(true);
    },
    deletePresent: function(present, hideUndo) {
        this.discardConfirm();
        if (present.createdBy != this.loggedInUser()) {
            var createdByName = this.getUserName(present.createdBy);
            var ok = this.confirm('Ce cadeau a \u00e9t\u00e9 cr\u00e9\u00e9 par ' + createdByName + '. Supprimer ?');
            if (!ok) {
                return;
            }
        }
        var clone = $.extend({}, present);
        clone.deletedBy = this.loggedInUser();
        this._savePresent(present, clone, hideUndo);
    },
    discardConfirm: function() {
        this.successMessage(null);
        this.errorMessage(null);
        this.undoAction(null);
    },
    addParty: function() {
        var userMap = this.users();
        var users = Object.keys(userMap).map(function(k){
            return userMap[k];
        });
        this.parties.push({
            title:ko.observable(),
            selected:ko.observable(false),
            users:users.map(function(e) {
                return {
                    selected:ko.observable(false),
                    name:e.name
                };
            })
        });
    },
    cancelManagement: function() {
        this.managing(false);
    },
    saveEditedParties: function() {
        this.managing(false);
    },
    selectMParty: function(idx) {
        var parties = this.parties();
        var oldselection = parties[this.selectedMParty()];
        var newselection = parties[idx];
        var users = Object.keys(oldselection.users);
        newselection.selected(true);
        oldselection.selected(false);
        for (var i = 0; i < users.length; i++) {
            oldselection.users[i].selected(this.mPartyUsers()[i].selected())
            this.mPartyUsers()[i].selected(newselection.users[i].selected())
        }
        this.selectedMParty(idx);
    },
    removeParty: function(i) {
        this.parties.remove(this.parties()[i]);
    },
    manageParties: function() {
        this.managing(true);
    }
};
