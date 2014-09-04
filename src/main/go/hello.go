package guestbook

import (
	//"fmt"
	"net/http"
	"time"
	"regexp"
	"strconv"
	"encoding/json"
	"io"
	"crypto/md5"

	"appengine"
	"appengine/datastore"
	"appengine/user"
)

type Greeting struct {
	Author  string
	Content string
	Date    time.Time
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
	http.Handle("/unauthenticated-resources/party", GetPartyResource())
	http.Handle("/unauthenticated-resources/party/", GetPartyResource())
}

// web helpers

type restHandlerF func(http.ResponseWriter, *http.Request, []string)

type RestHandler struct {
	Get restHandlerF
	Post restHandlerF
	Pattern *regexp.Regexp
}

func (t RestHandler) getHandler(r *http.Request) restHandlerF {
	var h restHandlerF
	switch r.Method {
	case "GET":
		h = t.Get
	case "POST":
		h = t.Post
	}
	if h == nil {
		h = func(w http.ResponseWriter, r *http.Request, m []string) {
			http.Error(w, "405 Method not allowed", http.StatusMethodNotAllowed)
		}
	}
	return h
}

func (t RestHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var matches = t.Pattern.FindStringSubmatch(r.URL.Path)
	var h = t.getHandler(r)
	h(w, r, matches)
}

func LoginRequired(handler handlerF) handlerF {
	return func(w http.ResponseWriter, r *http.Request) {
		c := appengine.NewContext(r)
		u := user.Current(c)
		if u == nil {
			http.Redirect(w, r, "/login", http.StatusFound)
		}
		handler(w, r)
	}
}

// resources

func GetIdFromMatches(m []string) int {
	if len(m) < 2 {
		return 0
	} else {
		id, err := strconv.Atoi(m[1])
		if err != nil {
			return 0
		} else {
			return id
		}
	}
}

func GetPartyResource() RestHandler {
	var res = RestHandler{
		Get: func(w http.ResponseWriter, r *http.Request, m []string) {
			c := appengine.NewContext(r)
			var id = m[1]
			//if id == 0 {
			//	http.NotFound(w, r)
			//	return
			//}
			c.Infof(id)
			var party = new(Party)
			err := datastore.Get(
				c,
				datastore.NewKey(
					c,
					"Party",
					id,
					0,
					nil),
				party)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			partyJson, _ := json.Marshal(party)
			w.Write(partyJson)
		},
		Post: func(w http.ResponseWriter, r *http.Request, m []string) {
			c := appengine.NewContext(r)
			//var party *Party
			//err := json.NewDecoder(r.Body).Decode(party)
			//if err != nil {
			//	http.NotFound(w, r) // todo change code
			//	return
			//}
			var h = md5.New()
			io.WriteString(h, r.FormValue("partyPassword"))
			var party = Party{
				HashedPassword: h.Sum(nil),
			}
			c.Infof("putting")
			_, err := datastore.Put(
				c,
				datastore.NewKey(
					c,
					"Party",
					r.FormValue("partyName"),
					0,
					nil),
				&party)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			http.Redirect(w, r, "/", http.StatusFound)
		},
		Pattern: regexp.MustCompile("/unauthenticated-resources/party/(.*)"),
	}
	return res
}


// old code from tutorial


//func welcome(w http.ResponseWriter, r *http.Request) {
//	w.Header().Set("Content-type", "text/html; charset=utf-8")
//	c := appengine.NewContext(r)
//	u := user.Current(c)
//	if u == nil {
//		url, _ := user.LoginURL(c, "/")
//		fmt.Fprintf(w, `<a href="%s">Sign in or register</a>`, url)
//		return
//	}
//	url, _ := user.LogoutURL(c, "/")
//	fmt.Fprintf(w, `Welcome, %s! (<a href="%s">sign out</a>)`, u, url)
//}
//
//// guestbookKey returns the key used for all guestbook entries.
//func guestbookKey(c appengine.Context) *datastore.Key {
//	// The string "default_guestbook" here could be varied to have multiple guestbooks.
//	return datastore.NewKey(c, "Guestbook", "default_guestbook", 0, nil)
//}
//
//func root(w http.ResponseWriter, r *http.Request) {
//	c := appengine.NewContext(r)
//	// Ancestor queries, as shown here, are strongly consistent with the High
//	// Replication Datastore. Queries that span entity groups are eventually
//	// consistent. If we omitted the .Ancestor from this query there would be
//	// a slight chance that Greeting that had just been written would not
//	// show up in a query.
//	q := datastore.NewQuery("Greeting").Ancestor(guestbookKey(c)).Order("-Date").Limit(10)
//	greetings := make([]Greeting, 0, 10)
//	if _, err := q.GetAll(c, &greetings); err != nil {
//		http.Error(w, err.Error(), http.StatusInternalServerError)
//		return
//	}
//	if err := guestbookTemplate.Execute(w, greetings); err != nil {
//		http.Error(w, err.Error(), http.StatusInternalServerError)
//	}
//}
//
//func sign(w http.ResponseWriter, r *http.Request) {
//	c := appengine.NewContext(r)
//	g := Greeting{
//		Content: r.FormValue("content"),
//		Date:    time.Now(),
//	}
//	if u := user.Current(c); u != nil {
//		g.Author = u.String()
//	}
//	// We set the same parent key on every Greeting entity to ensure each Greeting
//	// is in the same entity group. Queries across the single entity group
//	// will be consistent. However, the write rate to a single entity group
//	// should be limited to ~1/second.
//	key := datastore.NewIncompleteKey(c, "Greeting", guestbookKey(c))
//	_, err := datastore.Put(c, key, &g)
//	if err != nil {
//		http.Error(w, err.Error(), http.StatusInternalServerError)
//		return
//	}
//	http.Redirect(w, r, "/", http.StatusFound)
//}
