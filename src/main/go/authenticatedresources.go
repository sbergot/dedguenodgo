package dedguenodgo

import (
	//"fmt"
	//"log"
	"appengine"
	"appengine/datastore"
	"code.google.com/p/gorest"
)

type PresentService struct {
	gorest.RestService `root:"/authenticated-resources/user/{user:string}/"
                        consumes:"application/json"
                        produces:"application/json"`
	putPresent  gorest.EndPoint `method:"PUT"
                                 path:"/present/{id:int64}"
                                 postdata:"Present"`
	postPresent gorest.EndPoint `method:"POST"
                                 path:"/present"
                                 postdata:"Present"`
	getPresents gorest.EndPoint `method:"GET"
                                 path:"/presents"
                                 output:"[]Present"`
}

type UserService struct {
	gorest.RestService `root:"/authenticated-resources/"
                        consumes:"application/json"
                        produces:"application/json"`
	getUsers        gorest.EndPoint `method:"GET"
                                     path:"/users"
                                     output:"[]User"`
	postDisconnect  gorest.EndPoint `method:"POST"
                                     path:"/disconnect"
                                     postdata:"string"`
}

func getUserKey(c appengine.Context, userId string) *datastore.Key {
	return datastore.NewKey(c, "User", userId, 0, nil)
}

func(serv PresentService) PutPresent(present Present, userId string, id int64) {
	var c = GAEContext(serv.RestService)
	PutWithKey(serv.RestService, &present, getUserKey(c, userId), "", id)
}

func(serv PresentService) PostPresent(present Present, userId string) {
	var c = GAEContext(serv.RestService)
	Put(serv.RestService, &present, getUserKey(c, userId))
}

func(serv PresentService) GetPresents(userId string) []Present {
	var c = GAEContext(serv.RestService)
	var presents = make([]Present, 0)

	var user User
	err := datastore.Get(c, getUserKey(c, userId), &user)
	if err != nil {
		ReturnError(serv.RestService, "user not found", 500)
		return presents
	}

	err = GetAll(serv.RestService, &presents, getUserKey(c, userId))
	if err != nil {
		ReturnError(serv.RestService, "", 403)
		return presents
	}

	if user.Partner == "" {
		return presents
	}

	var partnerPresents = make([]Present, 0)
	err = GetAll(
		serv.RestService,
		&partnerPresents,
		getUserKey(c, user.Partner))
	CheckError(serv.RestService, err, "", 500)

	for _, p := range partnerPresents {
		if p.IsShared {
			presents = append(presents, p)
		}
	}

	return presents
}

func(serv UserService) PostDisconnect(data string) {
	var c = GAEContext(serv.RestService)
	err := ExpireSession(c, serv.Context.Request())
	CheckError(serv.RestService, err, "", 500)
	serv.RestService.ResponseBuilder().RemoveSessionToken("/")
}

func(serv UserService) GetUsers() []User {
	var users = make([]User, 0)
	err := GetAll(serv.RestService, &users, nil)
	CheckError(serv.RestService, err, "", 500)
	return users
}
