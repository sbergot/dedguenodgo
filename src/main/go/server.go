package dedguenodgo

import (
	"net/http"

	"appengine"
	"code.google.com/p/gorest"
)

func init() {
	gorest.RegisterService(new(UnauthenticatedService))
	gorest.RegisterService(new(UserService))
	gorest.RegisterService(new(PartyService))
	gorest.RegisterService(new(PresentService))
	http.Handle("/",LoginManager(gorest.Handle()))
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
