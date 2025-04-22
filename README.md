## be-go
Go Web API for a email chatbot app. Uses HTTP, Websockets, JWT, IMAP, SMPT, and GroqAI
#### Endpoints
- Auth
/auth/Login
/auth/Logout

- AI
/chat

- Email
/email/     //CRUD 

websocket listen to email updates
## fe


const (
	System    GroqRole = "system"
	User      GroqRole = "user"
	Assistant GroqRole = "assistant"
	Tool      GroqRole = "tool"
)

type PayloadMessage struct {
	Role    GroqRole `json:"role"`
	Content string   `json:"content"`
	Name    string   `json:"name"`
}

sytemMessage := groq.PayloadMessage{
		Role: groq.System,
		Content: `You are an email chatbot assistant that responds in JSON.
		You give 3 options for the body.
		The JSON object must use the schema: 
		{
		"to":"receiver email",
		"subject":"email subject",
		"body1":"email body option1",
		"body2":"email body option2",
		"body3":"email body option3"
		}`,
		Name: "System",
	}

    prompt.Payload.Messages = append(prompt.Payload.Messages, groq.PayloadMessage{
		Role:    groq.User,
		Content: fmt.Sprintf("Previous received email: %s\n Prompt: %s", prompt.RespondingTo.Text, prompt.Question),
		Name:    "user1",
	})

    	// Unmarshal the JSON bytes to modify the payload
	var payloadMap map[string]interface{}
	err = json.Unmarshal(jsonPayload, &payloadMap)
	if err != nil {
		return nil, err
	}

	// Add JSON mode configuration
	responseFormat := map[string]interface{}{
		"response_format": map[string]interface{}{
			"type": "json_object",
		},
	}
	for key, value := range responseFormat {
		payloadMap[key] = value
	}

    da me um email a dizer ola para o  ruiestuda@gmail.com