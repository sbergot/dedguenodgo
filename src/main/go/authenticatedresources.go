package dedguenodgo

import (
	//"fmt"
	"appengine"
	"appengine/datastore"
	"code.google.com/p/gorest"
)

type AuthenticatedService struct {
	gorest.RestService `root:"/authenticated-resources/user/{user:string}/"
                        consumes:"application/json"
                        produces:"application/json"`
	putPresent          gorest.EndPoint `method:"PUT"
                                         path:"/present/{id:int64}"
                                         postdata:"Present"`
	postPresent         gorest.EndPoint `method:"POST"
                                         path:"/present"
                                         postdata:"Present"`
	getUsersandPresents gorest.EndPoint `method:"GET"
                                         path:"/parties-and-users-and-presents"
                                         output:"PartiesPresentsUsers"`
	getPartyUsers       gorest.EndPoint `method:"GET"
                                         path:"/party/{party:int64}/user"
                                         output:"[]User"`
}

func getPartyKey(c appengine.Context, partyId int64) *datastore.Key {
	return datastore.NewKey(c, "Party", "", partyId, nil)
}

func getUserKey(c appengine.Context, userId string) *datastore.Key {
	return datastore.NewKey(c, "User", userId, 0, nil)
}

func checkUserCredentials(
	rs gorest.RestService,
	userId string,
	userPassword string) bool {
	var c = GAEContext(rs)
	var user User
	err := datastore.Get(c, getUserKey(c, userId), &user)
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
	var password = rs.Context.Request().Header.Get("dedguenodgo-userPassword")
	if password == "" {
		ReturnError(rs, "you must be logged to access this ressource", 403)
		return false
	}
	return checkUserCredentials(rs, userId, password)
}

func(serv AuthenticatedService) PutPresent(present Present, userId string, id int64) {
	if !isLogged(serv.RestService, userId) { return }
	var c = GAEContext(serv.RestService)
	PutWithKey(serv.RestService, &present, getUserKey(c, userId), "", id)
}

func(serv AuthenticatedService) PostPresent(present Present, userId string) {
	if !isLogged(serv.RestService, userId) { return }
	var c = GAEContext(serv.RestService)
	Put(serv.RestService, &present, getUserKey(c, userId))
}

func(serv AuthenticatedService) GetUsersandPresents(userId string) PartiesPresentsUsers {
	if !isLogged(serv.RestService, userId) { return PartiesPresentsUsers{} }
	var c = GAEContext(serv.RestService)

	var parties = make([]Party, 0)
	err := GetAll(serv.RestService, &parties, getUserKey(c, userId))
	if err != nil {
		ReturnError(serv.RestService, err.Error(), 500)
		return PartiesPresentsUsers{}
	}

	var presents = make([]Present, 0)
	err = GetAll(serv.RestService, &presents, getUserKey(c, userId))
	if err != nil {
		ReturnError(serv.RestService, err.Error(), 500)
		return PartiesPresentsUsers{}
	}

	var res = PartiesPresentsUsers{
		Parties: parties,
		Presents: presents,
	}

	if len(parties) == 0 {
		return res
	}

	var partyId = parties[0].Id
	var users = make([]User, 0)
	err = GetAll(serv.RestService, &users, getPartyKey(c, partyId))
	if err != nil {
		ReturnError(serv.RestService, err.Error(), 500)
		return PartiesPresentsUsers{}
	}
	res.Users = users
	return res
}

func(serv AuthenticatedService) GetPartyUsers(userId string, partyId int64) []User {
	if !isLogged(serv.RestService, userId) { return *new([]User) }
	var c = GAEContext(serv.RestService)
	var users = make([]User, 0)
	err := GetAll(serv.RestService, &users, getPartyKey(c, partyId))
	if err != nil {
		ReturnError(serv.RestService, err.Error(), 500)
		return *new([]User)
	}
	return users
}
