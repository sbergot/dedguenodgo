package dedguenodgo

import (
	//"fmt"
	"appengine"
	"appengine/datastore"
	"code.google.com/p/gorest"
)

type PartyService struct {
	gorest.RestService `root:"/authenticated-resources/"
                        consumes:"application/json"
                        produces:"application/json"`
	postParty           gorest.EndPoint `method:"POST"
                                         path:"/party"
                                         postdata:"Party"`
	getUsers            gorest.EndPoint `method:"GET"
                                         path:"/users"
                                         output:"[]User"`
}

type UserService struct {
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

func(serv UserService) PutPresent(present Present, userId string, id int64) {
	var c = GAEContext(serv.RestService)
	PutWithKey(serv.RestService, &present, getUserKey(c, userId), "", id)
}

func(serv UserService) PostPresent(present Present, userId string) {
	var c = GAEContext(serv.RestService)
	Put(serv.RestService, &present, getUserKey(c, userId))
}

func(serv UserService) GetUsersandPresents(userId string) PartiesPresentsUsers {
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

	var users = make([]User, 0)
	err = GetAll(serv.RestService, &users, nil)
	if err != nil {
		ReturnError(serv.RestService, err.Error(), 500)
		return PartiesPresentsUsers{}
	}

	return PartiesPresentsUsers{
		Parties: parties,
		Presents: presents,
		Users: users,
	}
}

func(serv UserService) GetPartyUsers(userId string, partyId int64) []User {
	var c = GAEContext(serv.RestService)
	var users = make([]User, 0)
	err := GetAll(serv.RestService, &users, getPartyKey(c, partyId))
	if err != nil {
		ReturnError(serv.RestService, err.Error(), 500)
		return *new([]User)
	}
	return users
}
