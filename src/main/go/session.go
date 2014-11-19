package dedguenodgo

import (
	"net/http"
	"strings"
	"crypto/rand"
	"fmt"
	"time"
	"io"
	"encoding/json"

	"appengine"
	"appengine/memcache"
	"appengine/datastore"
	"code.google.com/p/gorest"

	"log"
)

const SESSION = "X-Xsrf-Cookie"

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

func createSession(c appengine.Context, rb *gorest.ResponseBuilder, user User) {
	var uuid = newUUID()
	var b, err = json.Marshal(user)
	if err != nil { panic(err.Error()) }
	var item = &memcache.Item{
		Key: uuid,
		Value: b,
	}
	memcache.Set(c, item)
	rb.SetSessionToken(uuid, "/", time.Now().Add(time.Hour))
}



func checkUserCredentials(
	c appengine.Context,
	userId string,
	userPassword string) (bool, User) {
	var user User
	err := datastore.Get(c, getUserKey(c, userId), &user)
	if err != nil {
		log.Println("User not found")
		log.Println(err)
		log.Println(userId)
		log.Println(getUserKey(c, userId))
		return false, User{}
	}
	return user.Password.Check(userPassword), user
}

func authenticate(c appengine.Context, login LoginForm) (bool, User) {
	var password = login.Password
	var userId = login.UserName
	log.Println("logging user: ", userId)
	return checkUserCredentials(c, userId, password)
}

func checkSessionCache(c appengine.Context, sessionCookie *http.Cookie) bool {
	_, err := memcache.Get(c, sessionCookie.Value)
	if err != nil {
		log.Println("memcache get error: ", err)
	}
	return err == nil
}

func GetUser(c appengine.Context, r *http.Request) (User, error) {
	sessionCookie, err := r.Cookie(SESSION)
	var user User
	if err != nil { return user, err }
	b, err := memcache.Get(c, sessionCookie.Value)
	if err != nil { return user, err }
	err = json.Unmarshal(b.Value, &user)
	return user, err
}

func ExpireSession(c appengine.Context, r *http.Request) error {
	sessionCookie, err := r.Cookie(SESSION)
	if err != nil { return err }
	err = memcache.Delete(c, sessionCookie.Value)
	return err
}

func checkSession(
	c appengine.Context,
	w http.ResponseWriter,
	r *http.Request) bool {

	sessionCookie, err := r.Cookie(SESSION)
	if err == nil && checkSessionCache(c, sessionCookie) {
		sessionCookie.MaxAge = 3600
		sessionCookie.Path = "/"
		http.SetCookie(w, sessionCookie)
		return true
	}
	log.Println("session cookie error: ", err)
	return false
}

func CheckLogin(
	c appengine.Context,
	rb *gorest.ResponseBuilder,
	login LoginForm) bool {
	var isLogged, user = authenticate(c, login)
	if isLogged {
		log.Println("user logged")
		createSession(c, rb, user)
	}
	return isLogged
}

func LoginManager(handler http.Handler, safeUrls []string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var c = appengine.NewContext(r)
		var mustBeLogged = true
		for _, prefix := range safeUrls {
			if (strings.HasPrefix(r.URL.Path, prefix)) {
				mustBeLogged = false
				break
			}
		}
		if mustBeLogged && !checkSession(c, w, r) {
			http.Error(w, "you must be logged", 403)
			return
		}
		handler.ServeHTTP(w, r)
	}
}
