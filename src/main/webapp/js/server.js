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
        getUserUri: function(userId) {
            if (!this.login) {
                console.warn('calling server but login has not been set');
                return;
            }
            userId = userId || this.login.userId
            return 'authenticated-resources/user/' + userId;
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
                url: this.getUserUri(present.to) + '/present',
                contentType: 'application/json',
                type: 'POST',
                data: JSON.stringify(converted)
            };
            this.addAuthorizationToAjaxOptions(ajaxOptions);
            return $.ajax(ajaxOptions);
        },
        editPresent: function(oldPresent, newPresent) {
            var converted = Server._formatForServer(newPresent);
            var ajaxOptions = {
                url: this.getUserUri(oldPresent.to) + '/present/' + oldPresent.id,
                contentType: 'application/json',
                type: 'PUT',
                data: JSON.stringify(converted)
            };
            this.addAuthorizationToAjaxOptions(ajaxOptions);
            return $.ajax(ajaxOptions);
        },
        getPresents: function(userId) {
            var ajaxOptions = {
                url: this.getUserUri(userId) + '/presents',
                contentType: 'application/json',
                type: 'GET',
                dataType: "json"
            };
            this.addAuthorizationToAjaxOptions(ajaxOptions);
            return $.ajax(ajaxOptions).pipe(function(result) {
                return result.map(Server._formatFromServer);
            });
        },
        getUsers: function() {
            var ajaxOptions = {
                url: 'authenticated-resources/users',
                contentType: 'application/json',
                type: 'GET',
                dataType: "json"
            };
            this.addAuthorizationToAjaxOptions(ajaxOptions);
            return $.ajax(ajaxOptions);
        },
        saveParties: function(parties) {
            var ajaxOptions = {
                url: this.getPartyUri(),
                contentType: 'application/json',
                type: 'POST',
                data: JSON.stringify(parties)
            };
            this.addAuthorizationToAjaxOptions(ajaxOptions);
            return $.ajax(ajaxOptions);
        },
        getParties: function(parties) {
            var ajaxOptions = {
                url: this.getPartyUri(),
                contentType: 'application/json',
                type: 'GET',
                dataType: "json"
            };
            this.addAuthorizationToAjaxOptions(ajaxOptions);
            return $.ajax(ajaxOptions);
        },
        disconnect: function() {
            var ajaxOptions = {
                url: 'authenticated-resources/disconnect',
                type: 'POST',
            };
            this.addAuthorizationToAjaxOptions(ajaxOptions);
            return $.ajax(ajaxOptions);
        }
    };
})();
