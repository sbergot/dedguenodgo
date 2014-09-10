package dedguenodgo

import (
	//"fmt"
	"appengine"
	"appengine/datastore"
	"code.google.com/p/gorest"
)

type AuthenticatedService struct {
	gorest.RestService `root:"/authenticated-resources/party/{party:string}/"
                        consumes:"application/json"
                        produces:"application/json"`
	putPresent          gorest.EndPoint `method:"PUT"
                                         path:"/present/{id:int64}"
                                         postdata:"Present"`
	postPresent         gorest.EndPoint `method:"POST"
                                         path:"/present"
                                         postdata:"Present"`
	postUser            gorest.EndPoint `method:"POST"
                                         path:"/user"
                                         postdata:"User"`
	deleteUser          gorest.EndPoint `method:"DELETE"
                                         path:"/user/{id:int64}"`
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

func checkPartyCredentials(
	rs gorest.RestService,
	userId string,
	userPassword string) bool {
	var c = GAEContext(rs)
	var user User
	err := datastore.Get(c, getPartyKey(c, userId), &user)
	if err != nil {
		ReturnError(rs, "", 404)
		return false
	}
	if !user.Password.Check(userPassword) {
		ReturnError(rs, "wrong password", 403)
		return false
	}
	return true
}
func isLogged(rs gorest.RestService, userId string) bool {
	var password = rs.Context.Request().Header.Get("dedguenodgo-partyPassword")
	if password == "" {
		ReturnError(rs, "you must be logged to access this ressource", 403)
		return false
	}
	return checkPartyCredentials(rs, userId, password)
}

func(serv AuthenticatedService) PutPresent(present Present, partyId string, id int64) {
	if !isLogged(serv.RestService, partyId) { return }
	var c = GAEContext(serv.RestService)
	PutWithKey(serv.RestService, &present, getPartyKey(c, partyId), "", id)
}

func(serv AuthenticatedService) PostPresent(present Present, partyId string) {
	if !isLogged(serv.RestService, partyId) { return }
	var c = GAEContext(serv.RestService)
	Put(serv.RestService, &present, getPartyKey(c, partyId))
}

func(serv AuthenticatedService) PostUser(user User, partyId string) {
	if !isLogged(serv.RestService, partyId) { return }
	var c = GAEContext(serv.RestService)
	Put(serv.RestService, &user, getPartyKey(c, partyId))
}

func(serv AuthenticatedService) DeleteUser(partyId string, id int64) {
	if !isLogged(serv.RestService, partyId) { return }
	var c = GAEContext(serv.RestService)
	err := datastore.Delete(
		c,
		datastore.NewKey(c, "User", "", id, getPartyKey(c, partyId)))
	CheckError(serv.RestService, err, "", 500)
}

func(serv AuthenticatedService) GetUsersandPresents(partyId string) PresentsUsers {
	if !isLogged(serv.RestService, partyId) { return PresentsUsers{} }
	var c = GAEContext(serv.RestService)

	var users = make([]User, 0)
	err := GetAll(serv.RestService, &users, getPartyKey(c, partyId))
	if err != nil {
		ReturnError(serv.RestService, err.Error(), 500)
		return PresentsUsers{}
	}

	var presents = make([]Present, 0)
	err = GetAll(serv.RestService, &presents, getPartyKey(c, partyId))
	if err != nil {
		ReturnError(serv.RestService, err.Error(), 500)
		return PresentsUsers{}
	}

	return PresentsUsers{
		Presents: presents,
		Users: users,
	}
}

func(serv AuthenticatedService) GetPartyUsers(partyId string) []User {
	if !isLogged(serv.RestService, partyId) { return *new([]User) }
	return GetAllPartyUsers(serv.RestService, partyId)
}
