package dedguenodgo

import (
	"net/http"
	"strings"

	"appengine"
	"code.google.com/p/gorest"
)

func init() {
	gorest.RegisterService(new(UnauthenticatedService))
	gorest.RegisterService(new(UserService))
	http.Handle("/",checkLog(gorest.Handle()))
}


func checkLog(h http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var mustBeLogged = !strings.HasPrefix(r.URL.Path, "/unauthenticated-resources/")
		if mustBeLogged {
			w.Write([]byte("mustBeLogged"))
		} else {
			w.Write([]byte("mustNotBeLogged"))
		}
	}
}

func GAEContext(rs gorest.RestService) appengine.Context {
	return appengine.NewContext(rs.Context.Request())
}

func ReturnError(rs gorest.RestService, message string, code int) {
	rs.ResponseBuilder().
		SetResponseCode(code).
		Write([]byte(message)).
		Overide(true)
}

func CheckError(rs gorest.RestService, err error, message string, code int) {
	if err == nil { return }
	var msg = message
	if msg == "" {
		msg = err.Error()
	}
	ReturnError(rs, msg, code)
}
