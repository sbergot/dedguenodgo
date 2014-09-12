package dedguenodgo

import (
	"net/http"
	"strings"
	"crypto/rand"
	"fmt"
	"io"

	"appengine"
	"appengine/memcache"
	"appengine/datastore"
)

const SESSION = "session"

func newUUID() string {
	uuid := make([]byte, 16)
	n, err := io.ReadFull(rand.Reader, uuid)
	if n != len(uuid) || err != nil {
		panic(err.Error())
	}
	// variant bits; see section 4.1.1
	uuid[8] = uuid[8]&^0xc0 | 0x80
	// version 4 (pseudo-random); see section 4.1.3
	uuid[6] = uuid[6]&^0xf0 | 0x40
	return fmt.Sprintf("%x-%x-%x-%x-%x", uuid[0:4], uuid[4:6], uuid[6:8], uuid[8:10], uuid[10:])
}

func createSession(c appengine.Context, w http.ResponseWriter, r *http.Request) {
	var uuid = newUUID()
	var item = &memcache.Item{
		Key: uuid,
		Value: []byte("logged"),
	}
	memcache.Set(c, item)
	var cookie = &http.Cookie{
		Name: SESSION,
		Value: uuid,
		MaxAge: 3600, // seconds
		HttpOnly: true,
	}
	http.SetCookie(w, cookie)
}

func checkUserCredentials(
	c appengine.Context,
	userId string,
	userPassword string) bool {
	var user User
	err := datastore.Get(c, getUserKey(c, userId), &user)
	if err != nil {
		return false
	}
	return user.Password.Check(userPassword)
}

func authenticate(c appengine.Context, r *http.Request) bool {
	var password = r.Header.Get("dedguenodgo-userPassword")
	var userId = r.Header.Get("dedguenodgo-userId")
	return checkUserCredentials(c, password, userId)
}

func checkSessionCache(c appengine.Context, sessionCookie *http.Cookie) bool {
	_, err := memcache.Get(c, sessionCookie.Value)
	return err == nil
}

func checkLog(c appengine.Context, w http.ResponseWriter, r *http.Request) bool {
	sessionCookie, err := r.Cookie(SESSION)
	if err == nil && checkSessionCache(c, sessionCookie) {
		sessionCookie.MaxAge = 3600
		http.SetCookie(w, sessionCookie)
		return true
	}
	var isLogged = authenticate(c, r)
	if isLogged { createSession(c, w, r) }
	return isLogged
}

func LoginManager(handler http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var c = appengine.NewContext(r)
		var mustBeLogged = !strings.
			HasPrefix(r.URL.Path, "/unauthenticated-resources/")
		if mustBeLogged && !checkLog(c, w, r) {
			http.Error(w, "you must be logged", 403)
			return
		}
		handler.ServeHTTP(w, r)
	}
}
