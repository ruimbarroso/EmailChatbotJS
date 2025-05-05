package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/ruimbarroso/emailchatbot-be/src/pkg"
	"github.com/ruimbarroso/emailchatbot-be/src/types"
	"github.com/ruimbarroso/emailchatbot-be/src/utils"
)

var DEV bool = utils.GetEnv("ENVIRONMENT", "dev") == "dev"

type AuthHandler struct {
}

func (*AuthHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Unknown endpoint", http.StatusNotFound)
		return
	}
	aux := strings.Split(r.URL.Path, "/")
	path := aux[len(aux)-2]

	w.Header().Set("Content-Type", "application/json")
	switch path {
	case "me":
		user, ok := utils.GetFromContext[string, types.UserCredentials](r.Context(), "user")
		if !ok {
			http.Error(w, "Not logged in", http.StatusForbidden)
			return
		}
		resBody := make(map[string]interface{}, 2)
		resBody["email"] = user.Email
		resBody["provider"] = user.Provider

		jsonBody, err := json.Marshal(resBody)
		if err != nil {
			http.Error(w, "Unable to marshal user", http.StatusInternalServerError)
			return
		}

		w.Write(jsonBody)

	case "login":
		var requestBody types.UserCredentials
		if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		client, err := pkg.VerifyEmailCredentials(
			requestBody.Email,
			requestBody.Password,
			requestBody.Provider,
		)
		if err != nil {
			http.Error(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}
		defer client.Logout()

		token, err := utils.GenerateJWT(&requestBody)

		if err != nil {
			http.Error(w, "Unable to create auth token", http.StatusInternalServerError)
			return
		}

		cookie := &http.Cookie{
			Name:     "session_token",
			Value:    token,
			Path:     "/",
			HttpOnly: true,
			Secure:   !DEV,
			MaxAge:   3600 * 48,
		}

		http.SetCookie(w, cookie)
		w.Write([]byte("Logged in!"))

	case "logout":
		log.Printf("LOGOUT TEST")
		cookie := &http.Cookie{
			Name:     "session_token",
			Value:    "",
			Path:     "/",
			HttpOnly: true,
			Secure:   !DEV,
			MaxAge:   -1,
		}

		http.SetCookie(w, cookie)
		w.Write([]byte("Logged out!"))
	default:
		http.Error(w, "Unknown endpoint", http.StatusNotFound)
	}

}
