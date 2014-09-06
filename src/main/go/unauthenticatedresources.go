package dedguenodgo

import (
	"net/http"
	"io"
	"crypto/md5"

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

func(serv UnauthenticatedService) PostParty(posted PartyForm) {
	var c = GAEContext(serv.RestService)
	var h = md5.New()
	io.WriteString(h, posted.PartyPassword)
	var party = Party{
		HashedPassword: h.Sum(nil),
	}
	_, err := datastore.Put(
		c,
		datastore.NewKey(c, "Party", posted.PartyName, 0, nil),
		&party)
	if err != nil {
		serv.ResponseBuilder().SetResponseCode(http.StatusInternalServerError).Overide(true)
		return
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
		serv.ResponseBuilder().SetResponseCode(404)
		return *party
	}
	return *party
}
