package dedguenodgo

import (
	"net/http"
	"strings"
	"bytes"

	"appengine"
	"appengine/memcache"
)

func checkLog(r *http.Request) bool {
	sessionToken, err := r.Cookie("session")
	if err != nil { return authenticate(r) }
	item, err := memcache.Get(sessionToken.Value)
	if err != nil { return authenticate(r) }
	return bytes.Compare([]bytes(sessionToken.Value, item.Value)
}

func LoginManager(handler http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var c = appengine.NewContext(r)
		var mustBeLogged = !strings.
			HasPrefix(r.URL.Path, "/unauthenticated-resources/")
		if mustBeLogged && !checkLog(c, r) {
			http.Error(w, "you must be logged", 403)
			return
		}
		handler.ServeHTTP(w, r)
	}
}
