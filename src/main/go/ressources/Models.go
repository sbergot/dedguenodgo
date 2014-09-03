import (
    "time"

    "appengine/datastore"
)

type Party struct {
	id             string
	hashedPassword []byte
	passwordSalt   []byte
}

type Present struct {
	id           long
	parent       *datastore.Key
	title        string
	description  string
	to           long
	createdBy    long
	creationDate time.Time
	offeredBy    time.Time
	offeredDate  time.Time
	deletedBy    long
}

type User struct {
	id      long
	parent  *datastore.Key
	name    string
	deleted bool
}
