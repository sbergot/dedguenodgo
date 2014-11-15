function AppViewModel(options) {
    var self = this;
    this.confirm = options.confirm;
    this.prompt = options.prompt;
    this.server = options.server;
    this.logoutCallback = options.logoutCallback;

    this.managing = ko.observable(false);
    this.selectedMParty = ko.observable(-1);
    this.parties = ko.observableArray([]);
    this.visibleParties = function() {
        return self.parties().filter(function(e) {
            var userIdx = e.users.findIndex(function(u) {
                return u.name === self.loggedInUser();
            });
            if (userIdx === -1) { return false; }
            return e.users[userIdx].selected();
        });
    };
    this.selectedParty = ko.observable();
    this.users = ko.observable([]);
    this.mPartyUsers = ko.observable([]);
    this.loggedInUser = createStorageObservable(sessionStorage, 'loggedInUser');
    this.loggedIsAdmin = ko.computed(function() {
        var id = self.loggedInUser();
        var user = self.users()[id];
        if (!user) { return false; }
        return user.isAdmin;
    })
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
        description: ko.observable(),
        shared: ko.observable()
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
        if (self.server.login) {
            self.getPresents();
        }
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
        return this.server.getUsers().always(function() {
            self.initLoading(false);
        }).fail(function() {
            self.initError(true);
        }).done(function(users) {
            self.users(entitiesToMap(users, 'name'));
            var musers = users.map(function(e) {
                return {
                    selected:ko.observable(false),
                    name:e.name
                };
            });
            self.mPartyUsers(musers);
            self.getParties();
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
        if (this.parties().length === 0) {
            return [{ id:"err", label:"pas d'�vennement" }];
        }
        var loggedInUser = this.loggedInUser();
        var parties = this.parties()
            .filter(function(party) {
                return !!party.users
                    .find(function(u) {
                        return (u.name === loggedInUser) && u.selected();
                    });
            });
        var users = this.users();
        var userMap = {}
        var ids = Object.keys(users);
        for (var i =0; i < parties.length; i++) {
            for (var j =0; j < ids.length; j++) {
                user = userMap[ids[j]] || {
                    name : ids[j],
                    selected : false
                };
                selUser = parties[i].users
                    .find(function(u) {
                        return u.name === ids[j];
                    })
                if (selUser) {
                    user.selected |= selUser.selected()
                }
                userMap[ids[j]] = user;
            }
        };
        ids.sort(function(a, b) {
            if (a === loggedInUser) {
                return -1;
            }
            if (b === loggedInUser) {
                return 1;
            }
            return users[a].name < users[b].name ? -1 : 1;
        });
        return ids.filter(function(id) {
            return userMap[id].selected;
        }).map(function(id) {
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
    displayedUsers: function() {
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
    displayedPresents: function() {
        var selectedList = this.selectedList();
        var loggedInUser = this.loggedInUser();
        var self = this;
        var users = this.users();
        if (!users || !users[selectedList]) {
            return [];
        }
        var partner = users[selectedList].partner;
        var loggedPartner = users[loggedInUser].partner;
        return this.presents().filter(function(p) {
            if ((p.to != selectedList) &&
                (p.to != partner)) {
                return false;
            }
            if (p.deletedBy && !self.displayPresentAsOffered(p)) {
                return false;
            }
            if (p.to == loggedInUser && p.createdBy != loggedInUser) {
                return false;
            }
            if (p.isshared &&
                (p.to == loggedPartner || p.to == loggedInUser) &&
                p.createdBy != loggedInUser) {
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
        return '(ajouté par ' + this.getUserName(present.createdBy) + ')';
    },
    displayPresentIsShared: function(present) {
        return (present.isshared) ? '(partagé)' : null;
    },
    isEditedPresentModified: function() {
        var beforeModification = this._isCreating() ? {
            title: '',
            description: '',
            shared: false
        } : this.editedPresent();
        var hasChanges = false;
        if (this.edition.title() != beforeModification.title) {
            hasChanges = true;
        }
        if (this.edition.description() != beforeModification.description ||
           this.edition.shared() != beforeModification.isshared) {
            hasChanges = true;
        }
        return hasChanges;
    },
    editPresent: function(present) {
        this.discardConfirm();
        this.editedPresent(present);
        this.edition.title(present.title);
        this.edition.description(present.description);
        this.edition.shared(present.isshared);
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
                self.getPresents().done(function () {
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
                self.getPresents().done(function () {
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
        var isshared = this.edition.shared();
        if (this._isCreating()) {
            var id = "tempId" + this.nextId++;
            var present = {
                id: id,
                title: title,
                description: description,
                isshared: isshared,
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
            clone.isshared = isshared;
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
        this.getParties();
    },
    saveEditedParties: function() {
        this.managing(false);
        this.selectMParty(-1);
        var obsParties = this.parties();
        var parties = obsParties.map(function(e) {
            return {
                title : e.title(),
                users : e.users.filter(function(u) {
                    return u.selected();
                }).map(function(u) { return u.name; })
            };
        });
        this.server.saveParties(parties);
    },
    getParties: function() {
        var self = this;
        self.server.getParties().done(function(r) {
            var users = self.mPartyUsers().map(function(e) { return e.name; });
            self.parties.removeAll();
            self.selectedMParty(-1);
            self.parties(r.map(function(p) {
                var partyUsers = {}
                p.users.forEach(function(u) { partyUsers[u] = true; });
                return {
                    title : ko.observable(p.title),
                    selected : ko.observable(false),
                    users : users.map(function (u) {
                        return {
                            name : u,
                            selected : ko.observable(partyUsers[u] !== undefined)
                        };
                    })
                };
            }))
        });
    },
    selectMParty: function(idx) {
        var parties = this.parties();
        var oldSelect = this.selectedMParty();
        var oldselection = parties[oldSelect > -1 ? oldSelect : 0];
        var newselection = parties[idx > -1 ? idx : 0];
        var users = Object.keys(oldselection.users);
        oldselection.selected(false);
        newselection.selected(true);
        for (var i = 0; i < users.length; i++) {
            if (oldSelect > -1) {
                oldselection.users[i].selected(this.mPartyUsers()[i].selected());
            }
            if (idx > -1) {
                this.mPartyUsers()[i].selected(newselection.users[i].selected());
            }
        }
        this.selectedMParty(idx);
    },
    removeParty: function(i) {
        this.parties.remove(this.parties()[i]);
    },
    manageParties: function() {
        this.managing(true);
    },
    getPresents: function() {
        var self = this;
        // avoid displaying old data when switching users
        self.presents([]);
        this.server.getPresents(this.selectedList()).done(function(result) {
            self.presents(result);
        });
    }
};
