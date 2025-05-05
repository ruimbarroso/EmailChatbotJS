package pkg

import (
	"errors"
	"fmt"
	"io"
	"log"
	"mime"
	"strings"

	"github.com/emersion/go-imap/v2"
	"github.com/emersion/go-imap/v2/imapclient"
	"github.com/emersion/go-message/charset"
	"github.com/emersion/go-message/mail"
	"github.com/ruimbarroso/emailchatbot-be/src/types"
)

type ImapClient struct {
	client *imapclient.Client
}

func NewIMAPEmailClient(imapServer string) (*ImapClient, error) {

	options := &imapclient.Options{
		WordDecoder: &mime.WordDecoder{CharsetReader: charset.Reader},
	}
	client, err := imapclient.DialTLS(imapServer, options)
	if err != nil {
		return nil, errors.New("failed to connect to IMAP server: " + err.Error())
	}

	return &ImapClient{
		client: client,
	}, nil
}
func (c *ImapClient) Close() {
	c.client.Close()
}
func (c *ImapClient) Login(email string, password string) *imapclient.Command {
	return c.client.Login(email, password)
}
func (c *ImapClient) Logout() *imapclient.Command {
	return c.client.Logout()
}
func VerifyEmailCredentials(email, password, provider string) (*imapclient.Client, error) {
	imapServer := types.PROVIDERS[provider].ImapServer

	c, err := imapclient.DialTLS(imapServer, nil)
	if err != nil {
		return nil, err
	}

	if err := c.Login(email, password).Wait(); err != nil {
		return nil, err
	}

	return c, nil
}
func (c *ImapClient) GetMailboxes() []*types.Mailbox {

	boxes := make([]*types.Mailbox, 0)
	command := c.client.List("", "*", &imap.ListOptions{})

	for {
		data := command.Next()
		if data == nil {
			break
		}
		statusCommand := c.client.Status(data.Mailbox, &imap.StatusOptions{NumMessages: true, NumUnseen: true})

		status, err := statusCommand.Wait()
		if err != nil {
			log.Printf("Error fetching status for mailbox %v: %v", data.Mailbox, err)
			break
		}
		data.Status = status

		numMessages := uint32(0)
		if data.Status.NumMessages != nil {
			numMessages = *data.Status.NumMessages
		}
		numUnseen := uint32(0)
		if data.Status.NumUnseen != nil {
			numUnseen = *data.Status.NumUnseen
		}

		boxes = append(boxes, &types.Mailbox{
			Name:        data.Mailbox,
			NumMessages: numMessages,
			NumUnseen:   numUnseen,
		})
	}

	return boxes

}

func (c *ImapClient) SelectMailBox(mailboxName string, opt *imap.SelectOptions) *imapclient.SelectCommand {
	mailbox := c.client.Select(mailboxName, opt)

	return mailbox
}

func (c *ImapClient) DeselectMailBox() *imapclient.Command {
	return c.client.Unselect()
}
func (c *ImapClient) Query(criteria *imap.SearchCriteria) *imapclient.SearchCommand {
	return c.client.Search(criteria, &imap.SearchOptions{ReturnCount: true, ReturnAll: true})
}

func (c *ImapClient) Fetch(toFetch imap.NumSet) ([]*types.Email, error) {
	emails := make([]*types.Email, 0)
	fetchOptions := &imap.FetchOptions{
		BodySection: []*imap.FetchItemBodySection{{}},
	}
	fetchCmd := c.client.Fetch(toFetch, fetchOptions)
	defer fetchCmd.Close()

	for {
		msg := fetchCmd.Next()
		if msg == nil {
			break
		}

		var bodySection imapclient.FetchItemDataBodySection
		ok := false
		for {
			item := msg.Next()
			if item == nil {
				break
			}
			bodySection, ok = item.(imapclient.FetchItemDataBodySection)
			if ok {
				break
			}
		}
		if !ok {
			return nil, errors.New("FETCH command did not return body section")
		}

		mr, err := mail.CreateReader(bodySection.Literal)
		if err != nil {
			return nil, err
		}

		h := mr.Header

		email := types.Email{Attachments: make([]string, 0)}
		if date, err := h.Date(); err != nil {
			continue
		} else {
			email.Date = date
		}

		if from, err := h.AddressList("From"); err != nil {
			continue
		} else {
			email.From = from
		}

		if to, err := h.AddressList("To"); err != nil {
			continue
		} else {
			email.To = to
		}

		if subject, err := h.Text("Subject"); err != nil {
			email.Subject = ""
		} else {
			email.Subject = subject
		}

		if messageID, err := h.Text("Message-ID"); err != nil {
			continue
		} else {
			email.MessageId = messageID
		}
		if references, err := h.Text("References"); err != nil {
			email.References = ""
		} else {
			email.References = references
		}
		if replyTo, err := h.Text("In-Reply-To"); err != nil {
			email.ReplyTo = ""
		} else {
			email.ReplyTo = replyTo
		}

		for {
			p, err := mr.NextPart()
			if err == io.EOF {
				break
			} else if err != nil {
				continue
			}

			switch h := p.Header.(type) {
			case *mail.InlineHeader:
				ct := p.Header.Get("Content-Type")
				b, _ := io.ReadAll(p.Body)
				if strings.Contains(ct, "text/plain") {

					email.Body = string(b)
				} else {
					email.HTMLBody = string(b)
				}
			case *mail.AttachmentHeader:
				filename, _ := h.Filename()
				email.Attachments = append(email.Attachments, filename)
			}
		}

		emails = append(emails, &email)
	}

	if err := fetchCmd.Close(); err != nil {
		return nil, err
	}

	return emails, nil
}

func (c *ImapClient) LoadMailBoxes() []*types.Mailbox {
	boxes := c.GetMailboxes()
	return boxes
}

func (c *ImapClient) LoadEmailsPaginated(mailBox *types.Mailbox, pageSize, page uint32) (*types.Mailbox, error) {
	// Calculate message range for pagination
	start := mailBox.NumMessages - (page-1)*pageSize

	end := start - pageSize + 1

	// Ensure valid range
	if start <= pageSize || end < 1 {
		end = 1
	}

	// If no messages left
	if start < 1 {
		return nil, errors.New("no more messages to load")
	}

	fmt.Printf("Num: %v, Size: %v, Range: [%v  %v]\n", mailBox.NumMessages, pageSize, start, end)

	seqSet := &imap.SeqSet{}
	seqSet.AddRange(start, end)

	_, err := c.SelectMailBox(mailBox.Name, &imap.SelectOptions{ReadOnly: true}).Wait()
	if err != nil {
		log.Printf("Error Selecting Box, error: %v", err)
	}

	seqs := make([]imap.SeqSet, 1)
	seqs[0] = *seqSet
	query, err := c.Query(&imap.SearchCriteria{SeqNum: seqs}).Wait()
	if err != nil {
		log.Printf("Error Quering  Box, error: %v", err)
	}
	emails, err := c.Fetch(query.All)
	c.DeselectMailBox()
	if err != nil {
		return mailBox, err
	}
	mailBox.Emails = emails

	return mailBox, nil

}
