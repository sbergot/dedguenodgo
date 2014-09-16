package dedguenodgo

import (
	//"fmt"
	"appengine"
	"appengine/datastore"
	"code.google.com/p/gorest"
)

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

	var presents = make([]Present, 0)
	err := GetAll(serv.RestService, &presents, getUserKey(c, userId))
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
		Presents: presents,
		Users: users,
	}
}
