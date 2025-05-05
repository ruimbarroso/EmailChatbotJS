package types

import (
	"net/mail"
	"time"
)

type UserCredentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Provider string `json:"provider"`
}

type GroqRole string

const (
	System    GroqRole = "system"
	User      GroqRole = "user"
	Assistant GroqRole = "assistant"
	Tool      GroqRole = "tool"
)

type GroqMessage struct {
	Role    GroqRole `json:"role"`
	Content string   `json:"content"`
}
type GroqPayload struct {
	Model    string        `json:"model"`
	Messages []GroqMessage `json:"messages"`
}

// Responses
type GroqResponse struct {
	Id       string       `json:"id"`
	Model    string       `json:"model"`
	Messages []GroqChoice `json:"choices"`
}
type GroqChoice struct {
	Message GroqMessage `json:"message"`
	Index   int         `json:"index"`
	// FinishReason string      `json:"finish_reason"`
	// Logprobs     string      `json:"logprobs"`
}

// Email
type Mailbox struct {
	Name        string // Name of the mailbox.
	NumMessages uint32 // Total number of messages in the mailbox.
	NumUnseen   uint32 // Number of unseen messages in the mailbox.
	Emails      []*Email
}
type Email struct {
	Date        time.Time       // Timestamp of the email.
	From        []*mail.Address // List of sender addresses.
	To          []*mail.Address // List of recipient addresses.
	Subject     string          // Subject of the email.
	MessageId   string          // Unique message ID.
	References  string          // References to previous messages in the thread.
	ReplyTo     string          // Reply-To address for the email.
	Body        string          // Plaintext body of the email.
	HTMLBody    string          // HTML body of the email.
	Attachments []string        // List of attachment filenames.
}

type Provider struct {
	ImapServer string
	SmptHost   string
	SmptPort   string
}
type RequestMailboxFetch struct {
	Mailbox  string
	Page     uint32
	PageSize uint32
}
type RequestEmail struct {
	From    string
	To      []string
	Message string
}

var PROVIDERS = map[string]Provider{
	"gmail": {
		ImapServer: "imap.gmail.com:993",
		SmptHost:   "smtp.gmail.com",
		SmptPort:   "587",
	},
	"outlook": {
		ImapServer: "outlook.office365.com:993",
		SmptHost:   "smtp.office365.com",
		SmptPort:   "587",
	},
	"mail.com": {
		ImapServer: "imap.mail.com:993",
		SmptHost:   "smtp.mail.com",
		SmptPort:   "587",
	},
}
