(function() {
    window.LoginViewModel = function(options) {
        var self = this;

        this._server = options.server;
        this._loginCallback = options.loginCallback;

        this.userId = createStorageObservable(localStorage, 'userId');
        this.userPassword = createStorageObservable(sessionStorage, 'userPassword');
        this.user = ko.observable();
        this.users = ko.observable(null);
        this.sortedUsers = ko.computed(function() {
            var unsorted = self.users();
            return !unsorted ? null : unsorted.sort(function(a, b) {
                return a.name < b.name ? -1 : 1;
            });
        });

        this.userLoading = ko.observable(false);
        this.userError = ko.observable(false);
        this.userOk = ko.computed(function() {
            return self.users() !== null;
        });
        this.userActionLoading = ko.observable(false);
        this.userActionError = ko.observable(false);
        this.userActionOk = ko.observable(false);

        this.userId.subscribe(function() {
            self.users(null);
        });
        this.userPassword.subscribe(function() {
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
        submitUser: function() {
            var self = this;
            this.userLoading(true);
            this.userError(false);
                //needed for user edition commands
            self._loginCallback({
                userId: self.userId(),
                userPassword: self.userPassword()
            });
        }
    };
})();
