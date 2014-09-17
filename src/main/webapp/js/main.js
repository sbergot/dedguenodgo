$(document).ready(function() {

    var loginObservable = createStorageObservable(sessionStorage, 'login');
    var welcomeHidden = createStorageObservable(sessionStorage, 'welcomeHidden');

    window.server = new Server({
        invalidLoginCallback: function() {
            loginObservable(null);
        }
    });
    //little hack to wake up appengine
    //server.wakeUp();
    window.appViewModel = new AppViewModel({
        server: window.server,
        logoutCallback: function() {
            loginObservable(null);
        },
        confirm: function(t) {
            return confirm(t);
        },
        prompt: function(t) {
            return prompt(t);
        }
    });
    window.loginViewModel = new LoginViewModel({
        server: server,
        loginCallback: function(login) {
            loginObservable(login);
        }
    });
    var appDiv = $('#app');
    var welcomeDiv = $('#welcome');
    var loginDiv = $('#login');
    var loadingDiv = $('#loading');
    var errorDiv = $('#error');

    ko.applyBindings(window.appViewModel, appDiv[0]);
    ko.applyBindings(window.loginViewModel, loginDiv[0]);
    ko.applyBindings({
        welcomeHidden: welcomeHidden,
        hideWelcome: function() {
            welcomeHidden(true);
        }
    }, welcomeDiv[0]);

    function onLogin(login) {
        server.setLogin(login);

        if (!login || !login.userId) {
            appDiv.hide();
            loginDiv.show();
            loadingDiv.hide();
            errorDiv.hide();
        } else {
            appDiv.hide();
            loginDiv.hide();
            loadingDiv.show();
            errorDiv.hide();


            server.getUsers().always(function() {
                loadingDiv.hide();
            }).fail(function(e) {
                errorDiv.show();
                console.error(e);
            }).done(function(users) {
                appDiv.show();
                appViewModel.users(entitiesToMap(users, 'name'));
                var musers = users.map(function(e) {
                    return {
                        selected:ko.observable(false),
                        name:e.name
                    };
                });
                appViewModel.mPartyUsers(musers);
                appViewModel.loggedInUser(login.userId);
                appViewModel.getParties();
            });
        }
    }
    loginObservable.subscribe(onLogin);
    onLogin(loginObservable());
});
