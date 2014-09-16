(function() {
    var Server = function() {
        this.login = null;
    };
    window.Server = Server;

    Server._formatFromServer = function(present) {
        var result = $.extend({}, present);
        result.creationDate = Server._longToDate(result.creationDate);
        result.offeredDate = Server._longToDate(result.offeredDate);
        return result;
    };
    Server._formatForServer = function(present) {
        var result = $.extend({}, present);
        return result;
    };
    Server._longToDate = function(long) {
        return !long ? null : new Date(long);
    };

    Server.prototype = {
        getUserUri: function() {
            if (!this.login) {
                console.warn('calling server but login has not been set');
                return;
            }
            return 'authenticated-resources/user/' + this.login.userId;
        },
        getPartyUri: function() {
            if (!this.login) {
                console.warn('calling server but login has not been set');
                return;
            }
            return 'authenticated-resources/party';
        },
        addAuthorizationToAjaxOptions: function(ajaxOptions) {
            if (!this.login) {
                console.warn('calling server but login has not been set');
                return;
            }
            ajaxOptions.headers = {
                'dedguenodgo-userId': this.login.userId,
                'dedguenodgo-userPassword': this.login.userPassword,
            };
        },
        setLogin: function(login) {
            this.login = login;
        },
        wakeUp: function() {
            return $.get('unauthenticated-resources/wake-up');
        },
        addPresent: function(present) {
            var converted = Server._formatForServer(present);
            delete converted.id;
            var ajaxOptions = {
                url: this.getUserUri() + '/present',
                contentType: 'application/json',
                type: 'POST',
                data: JSON.stringify(converted),
                dataType: "json"
            };
            this.addAuthorizationToAjaxOptions(ajaxOptions);
            return $.ajax(ajaxOptions).pipe(Server._formatFromServer);
        },
        editPresent: function(oldPresent, newPresent) {
            var converted = Server._formatForServer(newPresent);
            var ajaxOptions = {
                url: this.getUserUri() + '/present/' + oldPresent.id,
                contentType: 'application/json',
                type: 'PUT',
                data: JSON.stringify(converted),
                dataType: "json"
            };
            this.addAuthorizationToAjaxOptions(ajaxOptions);
            return $.ajax(ajaxOptions).pipe(Server._formatFromServer);
        },
        getPartiesAndUsersAndPresents: function() {
            var ajaxOptions = {
                url: this.getUserUri() + '/parties-and-users-and-presents',
                contentType: 'application/json',
                type: 'GET',
                dataType: "json"
            };
            this.addAuthorizationToAjaxOptions(ajaxOptions);
            return $.ajax(ajaxOptions).pipe(function(result) {
                return {
                    users: result.users,
                    parties: result.parties,
                    presents: result.presents.map(Server._formatFromServer)
                };
            });
        },
        saveParties: function(parties) {
            var ajaxOptions = {
                url: this.getPartyUri(),
                contentType: 'application/json',
                type: 'POST',
                data: JSON.stringify(parties),
                dataType: "json"
            };
            this.addAuthorizationToAjaxOptions(ajaxOptions);
            return $.ajax(ajaxOptions).pipe(function(result) {
                return result;
            });
        },
        getParties: function(parties) {
            var ajaxOptions = {
                url: this.getPartyUri(),
                contentType: 'application/json',
                type: 'GET',
                dataType: "json"
            };
            this.addAuthorizationToAjaxOptions(ajaxOptions);
            return $.ajax(ajaxOptions).pipe(function(result) {
                return result;
            });
        },
    };
})();
