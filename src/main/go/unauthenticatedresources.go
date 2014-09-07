package dedguenodgo

import (
	"net/http"

	"appengine"
	"appengine/datastore"
	"code.google.com/p/gorest"
)

type UnauthenticatedService struct {
	gorest.RestService         `root:"/unauthenticated-resources/"
                                consumes:"application/json"
                                produces:"application/json"`
	postParty  gorest.EndPoint `method:"POST"
                                path:"/party/"
                                postdata:"PartyForm"`
	getParty   gorest.EndPoint `method:"GET"
                                path:"/party/{name:string}"
                                output:"Party"`
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
	if err != nil {
		serv.ResponseBuilder().
			SetResponseCode(http.StatusInternalServerError).
			Overide(true)
	}
}

func(serv UnauthenticatedService) GetParty(id string) Party {
	var c = GAEContext(serv.RestService)
	c.Infof(id)
	var party = new(Party)
	err := datastore.Get(
		c,
		datastore.NewKey(c, "Party", id, 0, nil),
		party)
	if err != nil {
		serv.ResponseBuilder().
			SetResponseCode(404).
			Overide(true)
		return *party
	}
	return *party
}
