package dedguenodgo

import (
	"fmt"
	"errors"
	"appengine"
	"appengine/datastore"
	"code.google.com/p/gorest"
)

type UnauthenticatedService struct {
	gorest.RestService          `root:"/unauthenticated-resources/"
                                 consumes:"application/json"
                                 produces:"application/json"`
	postUser    gorest.EndPoint `method:"POST"
                                 path:"/user/"
                                 postdata:"UserForm"`
	putPassword gorest.EndPoint `method:"PUT"
                                 path:"/user/change-password"
                                 postdata:"ChangePasswordForm"`
	postLogin   gorest.EndPoint `method:"POST"
                                 path:"/login"
                                 postdata:"LoginForm"`
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
		Partner: posted.UserPartner,
		Password: password,
	}
	PutWithKey(serv.RestService, &user, nil, posted.UserName, 0)
}

func(serv UnauthenticatedService) PutPassword(
	form ChangePasswordForm) {
	var c = GAEContext(serv.RestService)
	err := datastore.RunInTransaction(c, func(c1 appengine.Context) error {
		var user User
		var key = getUserKey(c1, form.UserName)
		err1 := datastore.Get(c1, key, &user)
		if err1 != nil { return err1 }
		if !user.Password.Check(form.OldPassword) {
			return errors.New(fmt.Sprintf(
				"invalid password: %v", form.OldPassword))
		}
		var password Password
		password.MakeFrom(form.NewPassword)
		user.Password = password
		_, err1 = datastore.Put(c1, key, &user)
		return err1
	}, nil)

	CheckError(serv.RestService, err, "", 500)
}

func(serv UnauthenticatedService) PostLogin(posted LoginForm) {
	var c = GAEContext(serv.RestService)
	CheckLogin(c, serv.RestService.ResponseBuilder(), posted);
}
