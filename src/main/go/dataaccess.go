package dedguenodgo

import (
	"reflect"
	"appengine/datastore"
	"code.google.com/p/gorest"
)

func Put(rs gorest.RestService, e interface{}, parent *datastore.Key) {
	PutWithKey(rs, e, parent, "", 0)
}

func PutWithKey(
	rs gorest.RestService,
	e interface{},
	parent *datastore.Key,
	skey string,
	ikey int64) {
	// e is a pointer to a serializable value
	var c = GAEContext(rs)
	var key = datastore.NewKey(c, reflect.TypeOf(e).Elem().Name(), skey, ikey, parent)
	_, err := datastore.Put(c, key, e)
	CheckError(rs, err, "", 500)
}

func hasId(t reflect.Type) bool {
	f, b := t.FieldByName("Id")
	if !b { return false }
	return f.Tag.Get("entity") == "Id"
}

func GetAll(rs gorest.RestService, elements interface{}, parent *datastore.Key) error {
	var c = GAEContext(rs)

	// elements is a pointer to a list of serializable values
	var t = reflect.TypeOf(elements).Elem().Elem()

	var query = datastore.NewQuery(t.Name()).Ancestor(parent)
	keys, err := query.GetAll(c, elements)
	if err != nil {
		return err
	}

	if !hasId(t) { return nil }

	// the Id is computed by the GAE datastore
	// we could assign the id before creating the values,
	// but that would require an allocation request to get
	// valid ids from the datastore.
	// We choose to assign it at each "Get",
	// using Id as a convention
	var ve = reflect.ValueOf(elements).Elem()
	for i := 0; i < ve.Len() ; i++ {
		var id = keys[i].IntID()
		ve.Index(i).FieldByName("Id").SetInt(id)
	}

	return nil
}
