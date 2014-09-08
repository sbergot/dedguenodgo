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
	postParty     gorest.EndPoint `method:"POST"
                                   path:"/party/"
                                   postdata:"PartyForm"`
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

func(serv UnauthenticatedService) PostParty(posted PartyForm) {
	var c = GAEContext(serv.RestService)
	if !checkAdminPassword(serv, posted.AdminPassword) {
		serv.ResponseBuilder().
			SetResponseCode(403).
			Overide(true)
		return
	}
	var password Password
	password.MakeFrom(posted.PartyPassword)
	var party = Party{Password: password}
	_, err := datastore.Put(
		c,
		datastore.NewKey(c, "Party", posted.PartyName, 0, nil),
		&party)
//	if err != nil {
//		ReturnError(serv.RestService, "", 500)
//		return
//	}
//
//	var user = User{
//		Name: "dummy",
//		Deleted: false,
//	}
//	_, err= datastore.Put(
//		c,
//		datastore.NewKey(c, "User", "", 0, getPartyKey(c, posted.PartyName)),
//		&user)
	CheckError(serv.RestService, err, "", 500)
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

func(serv UnauthenticatedService) GetUPartyUsers(partyId string) []User {
	//if !isLogged(serv.RestService, partyId) { return userMap }
	var c = GAEContext(serv.RestService)

	var query = datastore.NewQuery("User").Ancestor(getPartyKey(c, partyId))
	var users []User
	_, err := query.GetAll(c, &users)
	if err != nil {
		ReturnError(serv.RestService, "", 500)
		return users
	}
	if len(users) == 0 {
		users = append(users, User{Name:"", Deleted:false})
	}

	return users
}
