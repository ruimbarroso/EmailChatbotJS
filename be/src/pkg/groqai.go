package pkg

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/ruimbarroso/emailchatbot-be/src/types"
)

type Groq struct {
	client  *http.Client
	url     string
	groqKey string
}

func NewGroqClient(url string, groqKey string) *Groq {
	return &Groq{client: &http.Client{}, url: url, groqKey: groqKey}
}
func EncodePayload(payload map[string]interface{}) ([]byte, error) {
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return jsonPayload, nil
}

func DecodeResponse(data []byte) (*types.GroqResponse, error) {
	var response types.GroqResponse

	err := json.Unmarshal(data, &response)
	if err != nil {
		fmt.Println("Error decoding JSON:", err)
		return nil, err
	}

	return &response, nil
}

func (ai *Groq) SendPrompt(jsonPayload []byte) ([]byte, error) {
	req, err := http.NewRequest("POST", ai.url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		fmt.Println("Error creating request:", err)
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", ai.groqKey))
	req.Header.Set("Content-Type", "application/json")

	resp, err := ai.client.Do(req)
	if err != nil {
		fmt.Println("Error sending request:", err)
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response:", err)
		return nil, err
	}

	return body, nil
}
