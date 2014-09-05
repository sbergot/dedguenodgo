package guestbook

import (
	//"fmt"
	"net/http"
	"time"
	//"regexp"
	//"strconv"
	//"encoding/json"
	"io"
	"crypto/md5"

	"appengine"
	"appengine/datastore"
	//"appengine/user"
	"code.google.com/p/gorest"


)

type Greeting struct {
	Author  string
	Content string
	Date    time.Time
}

type PartyForm struct {
	AdminPassword string
	PartyName     string
	PartyPassword string
}

type Party struct {
	HashedPassword []byte
	PasswordSalt   []byte
	Presents       []Present
	Users          []User
}

type Present struct {
	Title        string
	Description  string `datastore:",noindex"`
	To           int64
	CreatedBy    int64
	CreationDate time.Time
	OfferedBy    time.Time
	OfferedDate  time.Time
	DeletedBy    int64
}

type User struct {
	Name    string
	Deleted bool
}

type handlerF func(http.ResponseWriter, *http.Request)

func init() {
	//http.Handle("/unauthenticated-resources/party", GetPartyResource())
	//http.Handle("/unauthenticated-resources/party/", GetPartyResource())
	gorest.RegisterService(new(UnauthenticatedService))
	http.Handle("/",gorest.Handle())
}

//Service Definition
type UnauthenticatedService struct {
	gorest.RestService         `root:"/unauthenticated-resources/"
                                consumes:"application/json" produces:"application/json"`
    postParty  gorest.EndPoint `method:"POST" path:"/party/" postdata:"PartyForm"`
    getParty   gorest.EndPoint `method:"GET" path:"/party/{name:string}" output:"Party"`
}

func (rs *UnauthenticatedService) GAEContext() appengine.Context {
	return appengine.NewContext(rs.Context.Request())
}

func(serv UnauthenticatedService) PostParty(posted PartyForm) {
	var c = serv.GAEContext()
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
		serv.ResponseBuilder().SetResponseCode(http.StatusInternalServerError)
		return
	}
}

func(serv UnauthenticatedService) GetParty(id string) Party {
	var c = serv.GAEContext()
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
