package ressources

import (
    "time"
    //"appengine/datastore"
)

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

type Greeting struct {
	Author  string
	Content string
	Date    time.Time
}
