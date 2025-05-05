package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/ruimbarroso/emailchatbot-be/src/pkg"
	"github.com/ruimbarroso/emailchatbot-be/src/types"
	"github.com/ruimbarroso/emailchatbot-be/src/utils"
)

type EmailHandler struct {
}

func (*EmailHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.URL.Path != "/email/" {
		http.Error(w, "Unknown endpoint", http.StatusNotFound)
		return
	}

	user, ok := utils.GetFromContext[string, types.UserCredentials](r.Context(), "user")
	if !ok {
		http.Error(w, "You are not authenticated", http.StatusForbidden)
		return
	}
	switch r.Method {
	case "POST":
		sendEmail(w, r, user)
	case "GET":
		query, ok := utils.GetFromContext[string, map[string]string](r.Context(), "query")
		if !ok {
			loadMailboxes(w, user)
			return
		}
		mailbox := "Inbox"
		var page uint32 = 1
		var size uint32 = 20
		for key, value := range *query {
			switch key {
			case "mailbox":
				mailbox = value
			case "page":
				num, err := strconv.Atoi(value)
				if err != nil || num <= 0 {
					http.Error(w, "page Parameter must be a positive number", http.StatusBadRequest)
					return
				}
				page = uint32(num)
			case "size":
				num, err := strconv.Atoi(value)
				if err != nil || num <= 0 {
					http.Error(w, "size Parameter must be a positive number", http.StatusBadRequest)
					return
				}
				size = uint32(num)
			}
		}

		loadEmails(w, &types.RequestMailboxFetch{
			Mailbox:  mailbox,
			Page:     page,
			PageSize: size,
		}, user)

	default:
		http.Error(w, "Unknown endpoint", http.StatusNotFound)
		return
	}
}

func loadMailboxes(w http.ResponseWriter, user *types.UserCredentials) {
	client, err := pkg.NewIMAPEmailClient(types.PROVIDERS[user.Provider].ImapServer)
	if err != nil {
		http.Error(w, "Error creating Imap connection", http.StatusInternalServerError)
		return
	}
	defer client.Close()

	err = client.Login(user.Email, user.Password).Wait()
	defer client.Logout()
	if err != nil {
		http.Error(w, "Error login in to Imap server", http.StatusBadRequest)
		return
	}

	boxes := client.LoadMailBoxes()

	jsonRes, err := json.Marshal(boxes)
	if err != nil {
		http.Error(w, "Error Marshing Mailboxes", http.StatusInternalServerError)
		return
	}
	w.Write(jsonRes)
}
func loadEmails(w http.ResponseWriter, mailBox *types.RequestMailboxFetch, user *types.UserCredentials) {
	client, err := pkg.NewIMAPEmailClient(types.PROVIDERS[user.Provider].ImapServer)
	if err != nil {
		http.Error(w, "Error creating Imap connection", http.StatusInternalServerError)
		return
	}
	defer client.Close()

	err = client.Login(user.Email, user.Password).Wait()
	defer client.Logout()
	if err != nil {
		http.Error(w, "Error login in to Imap server", http.StatusBadRequest)
		return
	}

	var resBox *types.Mailbox
	boxes := client.LoadMailBoxes()
	for _, box := range boxes {
		if box.Name == mailBox.Mailbox {
			resBox, err = client.LoadEmailsPaginated(box, mailBox.PageSize, mailBox.Page)
			if err != nil {
				http.Error(w, "Error fetching Emails", http.StatusInternalServerError)
				return
			}
		}
	}

	jsonRes, err := json.Marshal(resBox)
	if err != nil {
		http.Error(w, "Error Marshing Emails", http.StatusInternalServerError)
		return
	}
	w.Write(jsonRes)
}

func sendEmail(w http.ResponseWriter, r *http.Request, user *types.UserCredentials) {

	var email types.RequestEmail
	if err := json.NewDecoder(r.Body).Decode(&email); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	err := pkg.SendEmail(
		pkg.CreateSmptAuth(user.Email, user.Password, types.PROVIDERS[user.Provider].SmptHost),
		email.From,
		email.To,
		[]byte(email.Message),
		pkg.CreateAddress(types.PROVIDERS[user.Provider].SmptHost, types.PROVIDERS[user.Provider].SmptPort))
	if err != nil {
		http.Error(w, "Error Sending Email", http.StatusInternalServerError)
		return
	}

	w.Write([]byte("Email Sent"))
}
