package dedguenodgo

import (
	"appengine"
	"appengine/datastore"
	"code.google.com/p/gorest"
)

type AuthenticatedService struct {
	gorest.RestService `root:"/authenticated-resources/party/{party:string}/"
                        consumes:"application/json"
                        produces:"application/json"`
	putPresent          gorest.EndPoint `method:"PUT"
                                         path:"/present/{id:int}"
                                         postdata:"Present"`
	postPresent         gorest.EndPoint `method:"POST"
                                         path:"/present"
                                         postdata:"Present"`
	postUser            gorest.EndPoint `method:"POST"
                                         path:"/user"
                                         postdata:"User"`
	deleteUser          gorest.EndPoint `method:"DELETE"
                                         path:"/user/{id:int}"`
	getUsersandPresents gorest.EndPoint `method:"GET"
                                         path:"/users-and-presents"
                                         output:"PresentsUsers"`
	getPartyUsers       gorest.EndPoint `method:"GET"
                                         path:"/party-users"
                                         output:"[]User"`
}

func getPartyKey(c appengine.Context, partyId string) *datastore.Key {
	return datastore.NewKey(c, "Party", partyId, 0, nil)
}

func isLogged(rs gorest.RestService, partyId string) bool {
	var c = GAEContext(rs)
	var party Party
	err := datastore.Get(c, getPartyKey(c, partyId), &party)
	if err != nil {
		ReturnError(rs, "", 404)
		return false
	}
	var password = rs.Context.Request().Header.Get("dedguenodgo-partyPassword")
	if password == "" {
		ReturnError(rs, "you must be logged to access this ressource", 403)
		return false
	}
	if !party.Password.Check(password) {
		ReturnError(rs, "wrong password", 403)
		return false
	}
	return true
}

func(serv AuthenticatedService) PutPresent(present Present, partyId string, id int) {
	if !isLogged(serv.RestService, partyId) { return }
	var c = GAEContext(serv.RestService)
	_, err := datastore.Put(
		c,
		datastore.NewKey(c, "Present", "", int64(id), getPartyKey(c, partyId)),
		&present)
	CheckError(serv.RestService, err, "", 500)
}

func(serv AuthenticatedService) PostPresent(present Present, partyId string) {
	if !isLogged(serv.RestService, partyId) { return }
	var c = GAEContext(serv.RestService)
	_, err := datastore.Put(
		c,
		datastore.NewKey(c, "Present", "", 0, nil),
		&present)
	CheckError(serv.RestService, err, "", 500)
}

func(serv AuthenticatedService) PostUser(user User, partyId string) {
	if !isLogged(serv.RestService, partyId) { return }
	var c = GAEContext(serv.RestService)
	_, err := datastore.Put(
		c,
		datastore.NewKey(c, "User", "", 0, nil),
		&user)
	CheckError(serv.RestService, err, "", 500)
}

func(serv AuthenticatedService) DeleteUser(partyId string, id int) {
	if !isLogged(serv.RestService, partyId) { return }
	var c = GAEContext(serv.RestService)
	err := datastore.Delete(
		c,
		datastore.NewKey(c, "User", "", int64(id), nil))
	CheckError(serv.RestService, err, "", 500)
}

func(serv AuthenticatedService) GetUsersandPresents(partyId string) PresentsUsers {
	if !isLogged(serv.RestService, partyId) { return PresentsUsers{} }
	var c = GAEContext(serv.RestService)

	var uquery = datastore.NewQuery("User").Ancestor(getPartyKey(c, partyId))
	var users []User
	ukeys, err := uquery.GetAll(c, &users)
	if err != nil {
		ReturnError(serv.RestService, "", 500)
		return PresentsUsers{}
	}

	var pquery = datastore.NewQuery("Present").Ancestor(getPartyKey(c, partyId))
	var presents []Present
	_, err = pquery.GetAll(c, &presents)
	if err != nil {
		ReturnError(serv.RestService, "", 500)
		return PresentsUsers{}
	}

	var userMap map[int]User
	for i, key := range ukeys {
		var id = int(key.IntID())
		userMap[id] = users[i]
	}

	return PresentsUsers{
		Presents: presents,
		Users: userMap,
	}
}

func(serv AuthenticatedService) GetPartyUsers(partyId string) []User {
	if !isLogged(serv.RestService, partyId) { return *new([]User) }
	var c = GAEContext(serv.RestService)

	var query = datastore.NewQuery("User").Ancestor(getPartyKey(c, partyId))
	var users []User
	_, err := query.GetAll(c, &users)
	if err != nil {
		ReturnError(serv.RestService, "", 500)
		return *new([]User)
	}

	return users
}
