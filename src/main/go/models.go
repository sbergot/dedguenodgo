package dedguenodgo

import (
	"time"
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

type PresentsUsers struct {
	Presents []Present
	Users    map[int]User
}
