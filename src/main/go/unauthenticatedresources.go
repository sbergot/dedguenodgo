package dedguenodgo

import (
	//"fmt"
	"appengine"
	"appengine/datastore"
	"code.google.com/p/gorest"
)

type UnauthenticatedService struct {
	gorest.RestService         `root:"/unauthenticated-resources/"
                                consumes:"application/json"
                                produces:"application/json"`
	postUser      gorest.EndPoint `method:"POST"
                                   path:"/user/"
                                   postdata:"UserForm"`
}

func getAdminPasswordKey(c appengine.Context) *datastore.Key {
	return datastore.NewKey(c, "AdminPassword", "adminPassword", 0, nil)
}

func checkAdminPassword(serv UnauthenticatedService, inp string) bool {
	var c = GAEContext(serv.RestService)
	var password Password
	var key = getAdminPasswordKey(c)
	err := datastore.Get(c, key, &password)
	if err != nil {
		// password doesn't exist. We need to create one
		password.MakeFrom(inp)
		_, err := datastore.Put(c, key, &password)
		if err != nil {
			panic(err.Error())
		}
		return true
	}
	return password.Check(inp)
}

func(serv UnauthenticatedService) PostUser(posted UserForm) {
	if !checkAdminPassword(serv, posted.AdminPassword) {
		ReturnError(serv.RestService, "", 403)
		return
	}
	var password Password
	password.MakeFrom(posted.UserPassword)
	var user = User{
		Name: posted.UserName,
		Deleted: false,
		IsAdmin: posted.UserIsAdmin == "on",
		Mail: posted.UserMail,
		Password: password,
	}
	PutWithKey(serv.RestService, &user, nil, posted.UserName, 0)
}
