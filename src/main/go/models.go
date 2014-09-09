package dedguenodgo

import (
	"time"
	"appengine/datastore"
)

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
	Id           int64      `datastore:"-" json:"id" entity:"Id"`
	Title        string     `json:"title"`
	Description  string     `json:"description" datastore:",noindex"`
	To           int64      `json:"to"`
	CreatedBy    int64      `json:"createdBy"`
	CreationDate time.Time  `json:"creationDate"`
	OfferedBy    *int64     `json:"offeredBy" datastore:"-"`
	OfferedDate  *time.Time `json:"offeredDate" datastore:"-"`
	OfferedBy_   int64      `json:"-"`
	OfferedDate_ time.Time  `json:"-"`
	DeletedBy    *int64     `json:"deletedBy" datastore:"-"`
	DeletedBy_   int64      `json:"-"`
}

func (x *Present) Load(c <-chan datastore.Property) error {
	if err := datastore.LoadStruct(x, c); err != nil {
		return err
	}
	var minTime time.Time
	x.OfferedDate = &x.OfferedDate_
	if *x.OfferedDate == minTime { x.OfferedDate = nil }
	x.OfferedBy = &x.OfferedBy_
	if *x.OfferedBy == 0 { x.OfferedBy = nil }
	x.DeletedBy = &x.DeletedBy_
	if *x.DeletedBy == 0 { x.DeletedBy = nil }
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


type User struct {
	Id      int64  `datastore:"-" json:"id" entity:"Id"`
	Name    string `json:"name"`
	Deleted bool   `json:"deleted"`
}

type PresentsUsers struct {
	Presents []Present `json:"presents"`
	Users    []User    `json:"users"`
}
