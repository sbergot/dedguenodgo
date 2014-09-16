package dedguenodgo

import (
	"time"
	"appengine/datastore"
)

type Password struct {
	Hash []byte
	Salt []byte
}

type Party struct {
	Id    int64   `datastore:"-" json:"id" entity:"Id"`
	Title string
}

type Present struct {
	Id           int64      `datastore:"-" json:"id" entity:"Id"`
	Title        string     `json:"title"`
	Party        Party      `json:"party"`
	Description  string     `json:"description" datastore:",noindex"`
	To           string     `json:"to"`
	CreatedBy    string     `json:"createdBy"`
	CreationDate time.Time  `json:"creationDate"`
	OfferedBy    *string    `json:"offeredBy" datastore:"-"`
	OfferedDate  *time.Time `json:"offeredDate" datastore:"-"`
	OfferedBy_   string     `json:"-"`
	OfferedDate_ time.Time  `json:"-"`
	DeletedBy    *string    `json:"deletedBy" datastore:"-"`
	DeletedBy_   string     `json:"-"`
}

func (x *Present) Load(c <-chan datastore.Property) error {
	if err := datastore.LoadStruct(x, c); err != nil {
		return err
	}
	var minTime time.Time
	x.OfferedDate = &x.OfferedDate_
	if *x.OfferedDate == minTime { x.OfferedDate = nil }
	x.OfferedBy = &x.OfferedBy_
	if *x.OfferedBy == "" { x.OfferedBy = nil }
	x.DeletedBy = &x.DeletedBy_
	if *x.DeletedBy == "" { x.DeletedBy = nil }
	return nil
}

func (x *Present) Save(c chan<- datastore.Property) error {
	if x.OfferedDate != nil {
		x.OfferedDate_ = *x.OfferedDate
	}
	if x.OfferedBy != nil {
		x.OfferedBy_ = *x.OfferedBy
	}
	if x.DeletedBy != nil {
		x.DeletedBy_ = *x.DeletedBy
	}
	return datastore.SaveStruct(x, c)
}

type UserForm struct {
	AdminPassword string
	UserName      string
	UserPassword  string
	UserMail      string
	UserIsAdmin   string
}

type User struct {
	Name    string `json:"name"`
	Deleted bool   `json:"deleted"`
	IsAdmin bool   `json:"isAdmin"`
	Mail    string `json:"mail"`
	Password       `json:"-"`
}

type PartiesPresentsUsers struct {
	Presents []Present `json:"presents"`
	Users    []User    `json:"users"`
}
