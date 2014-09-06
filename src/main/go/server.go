package dedguenodgo

import (
	"net/http"

	"appengine"
	"code.google.com/p/gorest"
)

func init() {
	gorest.RegisterService(new(UnauthenticatedService))
	gorest.RegisterService(new(AuthenticatedService))
	http.Handle("/",gorest.Handle())
}

func GAEContext(rs gorest.RestService) appengine.Context {
	return appengine.NewContext(rs.Context.Request())
}
