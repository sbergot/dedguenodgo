package dedguenodgo

import (
	"net/http"

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

func(serv AuthenticatedService) PutPresent(present Present, id int) {
	var c = GAEContext(serv.RestService)
	_, err := datastore.Put(
		c,
		datastore.NewKey(c, "Present", "", int64(id), nil),
		&present)
	CheckError(serv.RestService, err, "", 500)
}
func(serv AuthenticatedService) PostPresent(present Present) {
	var c = GAEContext(serv.RestService)
	_, err := datastore.Put(
		c,
		datastore.NewKey(c, "Present", "", 0, nil),
		&present)
	if err != nil {
		serv.ResponseBuilder().SetResponseCode(http.StatusInternalServerError)
		return
	}
}
func(serv AuthenticatedService) PostUser(user User) {
	var c = GAEContext(serv.RestService)
	_, err := datastore.Put(
		c,
		datastore.NewKey(c, "User", "", 0, nil),
		&user)
	if err != nil {
		serv.ResponseBuilder().SetResponseCode(http.StatusInternalServerError)
		return
	}
}
func(serv AuthenticatedService) DeleteUser(id int) {
	var c = GAEContext(serv.RestService)
	err := datastore.Delete(
		c,
		datastore.NewKey(c, "User", "", int64(id), nil))
	if err != nil {
		serv.ResponseBuilder().SetResponseCode(http.StatusInternalServerError)
		return
	}
}
func(serv AuthenticatedService) GetUsersandPresents() PresentsUsers {
	return PresentsUsers{}
}
func(serv AuthenticatedService) GetPartyUsers() []User {
	return *new([]User)
}
