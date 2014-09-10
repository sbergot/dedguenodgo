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
	getParty      gorest.EndPoint `method:"GET"
                                   path:"/party/{name:string}"
                                   output:"Party"`
	getUPartyUsers gorest.EndPoint `method:"GET"
                                   path:"/party/{name:string}/users"
                                   output:"[]User"`
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
		Mail: posted.UserMail,
		Password: password,
	}
	PutWithKey(serv.RestService, &user, nil, posted.UserName, 0)
}

func(serv UnauthenticatedService) GetParty(id string) Party {
	var c = GAEContext(serv.RestService)
	c.Infof(id)
	var party = new(Party)
	err := datastore.Get(
		c,
		datastore.NewKey(c, "Party", id, 0, nil),
		party)
	CheckError(serv.RestService, err, "", 404)
	return *party
}

func GetAllPartyUsers(rs gorest.RestService, partyId string) []User {
	var c = GAEContext(rs)

	var req = rs.Context.Request()
	req.ParseForm()
	var password = req.Form.Get("password")
	if !checkPartyCredentials(rs, partyId, password) {
		ReturnError(rs, "you must be logged to access this ressource", 403)
		return *new([]User)
	}
	var users = make([]User, 0)
	err := GetAll(rs, &users, getPartyKey(c, partyId))
	if err != nil {
		ReturnError(rs, "", 500)
		return *new([]User)
	}

	return users
}

func(serv UnauthenticatedService) GetUPartyUsers(partyId string) []User {
	return GetAllPartyUsers(serv.RestService, partyId)
}
