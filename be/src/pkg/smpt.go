package pkg

import (
	"fmt"
	"net/smtp"
)

func CreateSmptAuth(email string, password string, smtpHost string) smtp.Auth {
	return smtp.PlainAuth("", email, password, smtpHost)
}
func CreateAddress(smtpHost string, smtpPort string) string {
	return fmt.Sprintf("%s:%s", smtpHost, smtpPort)
}
func SendEmail(auth smtp.Auth, from string, to []string, message []byte, addr string) error {
	return smtp.SendMail(
		addr,
		auth,
		from,
		to,
		message)
}
