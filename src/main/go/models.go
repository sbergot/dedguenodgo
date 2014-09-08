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

type Password struct {
	Hash []byte
	Salt []byte
}

type Party struct {
	Password Password
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
	Id      int64  `datastore:"-" json:"id"`
	Name    string `json:"name"`
	Deleted bool   `json:"deleted"`
}

type PresentsUsers struct {
	Presents []Present `json:"presents"`
	Users    []Username `json:"username"`
}
