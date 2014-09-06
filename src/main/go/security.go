package dedguenodgo

import (
	"net/http"
	"io"
	"crypto/md5"

	"appengine/datastore"
	"code.google.com/p/gorest"
)

func hash(inp string, salt []byte) []byte {
	var h = md5.New()
	io.Write(h, salt)
	io.WriteString(h, inp)
	return h.Sum(nil)
}

func (pw *Password) Check(inp string) {
	return (pw.Hash == hash(inp, pw.Salt))
}

func (pw *Password) MakeFrom(inp string) {
	var salt = generateRandomSalt()
	pw.Salt = salt
	pw.Hash = hash(inp, salt)
}
