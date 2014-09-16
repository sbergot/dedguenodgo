
package dedguenodgo

import (
	//"fmt"
	//"appengine"
	"appengine/datastore"
	"code.google.com/p/gorest"
)

type PartyService struct {
	gorest.RestService `root:"/authenticated-resources/"
                        consumes:"application/json"
                        produces:"application/json"`
	postParties         gorest.EndPoint `method:"POST"
                                         path:"/party"
                                         postdata:"string"`
	getParties          gorest.EndPoint `method:"GET"
                                         path:"/party"
                                         output:"string"`
}

const partiesKey = "PARTIES_KEY"
const partiesEntity = "PARTIES_ENTITY"

type Parties struct {
	Data  string
}

// we manage parties with a simple json
// we choose to trust the client for its format
func(serv PartyService) PostParties(parties string) {
	var c = GAEContext(serv.RestService)
	user, err := GetUser(c, serv.Context.Request())
	if err != nil {
		ReturnError(serv.RestService, "", 403)
		return
	}
	if !user.IsAdmin {
		ReturnError(serv.RestService, "", 403)
		return
	}
	var key = datastore.NewKey(c, partiesEntity, partiesKey, 0, nil)
	_, err = datastore.Put(c, key, &Parties{ Data : parties })
	CheckError(serv.RestService, err, "", 500)
}

func(serv PartyService) GetParties() string {
	var c = GAEContext(serv.RestService)
	var parties Parties
	var key = datastore.NewKey(c, partiesEntity, partiesKey, 0, nil)
	err := datastore.Get(c, key, &parties)
	CheckError(serv.RestService, err, "", 404)
	return parties.Data
}
