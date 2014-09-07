package dedguenodgo

import (
	"io"
	"crypto/md5"
	"crypto/rand"
	"bytes"
)

func hash(inp string, salt []byte) []byte {
	var h = md5.New()
	h.Write(salt)
	io.WriteString(h, inp)
	return h.Sum(nil)
}

func generateRandomSalt() []byte {
	var salt = make([]byte, 16)
	_, err := rand.Read(salt)
	if err != nil {
		panic(err.Error())
	}
	return salt
}

func (pw *Password) Check(inp string) bool {
	return bytes.Equal(pw.Hash, hash(inp, pw.Salt))
}

func (pw *Password) MakeFrom(inp string) {
	var salt = generateRandomSalt()
	pw.Salt = salt
	pw.Hash = hash(inp, salt)
}
