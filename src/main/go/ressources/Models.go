import (
    "time"

    "appengine/datastore"
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
	To           long
	CreatedBy    long
	CreationDate time.Time
	OfferedBy    time.Time
	OfferedDate  time.Time
	DeletedBy    long
}

type User struct {
	Name    string
	Deleted bool
}
