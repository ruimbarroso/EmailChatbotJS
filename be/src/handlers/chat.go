package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/ruimbarroso/emailchatbot-be/src/pkg"
	"github.com/ruimbarroso/emailchatbot-be/src/types"
	"github.com/ruimbarroso/emailchatbot-be/src/utils"
)

var groqAi = pkg.NewGroqClient(utils.GetEnv("GROQ_URL", "https://api.groq.com/openai/v1/chat/completions"), utils.GetEnv("GROQ_API_KEY", "secretKey"))

type AiChatHandler struct {
}

func (*AiChatHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" || r.URL.Path != "/chat/" {
		http.Error(w, "Unknown endpoint", http.StatusNotFound)
		return
	}

	_, ok := utils.GetFromContext[string, types.UserCredentials](r.Context(), "user")
	if !ok {
		http.Error(w, "You are not authenticated", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	var requestBody types.GroqPayload
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	payload, err := pkg.EncodePayload(requestBody)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	res, err := groqAi.SendPrompt(payload)
	if err != nil {
		http.Error(w, "Error invalid prompt groqAi", http.StatusInternalServerError)
		return
	}

	resPayload, err := pkg.DecodeResponse(res)
	if err != nil {
		http.Error(w, "Error reading groq response", http.StatusInternalServerError)
		return
	}

	jsonPayload, err := json.Marshal(resPayload)
	if err != nil {
		http.Error(w, "Error marshling groq response", http.StatusInternalServerError)
		return
	}
	w.Write([]byte(jsonPayload))
}
