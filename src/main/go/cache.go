package dedguenodgo

import (
	"net/http"
	"encoding/json"
	"appengine"
	"appengine/memcache"
)

func CheckCache(r *http.Request, obj interface{}) bool {
	var key = r.URL.Path
	var c = appengine.NewContext(r)
	item, err := memcache.Get(c, key)
	if err != nil { return false }
	err = json.Unmarshal(item.Value, obj)
	return err == nil
}
