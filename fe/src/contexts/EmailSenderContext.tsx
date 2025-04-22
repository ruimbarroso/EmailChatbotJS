import { JSX, useCallback, useState } from "react";
import { Attachment, Email, EmailPost, EmailSenderContext, GroqAiMessage, GroqAiRole, useAuth } from "./Contexts";


const API_URL = import.meta.env.VITE_API_URL;

export const EmailSenderProvider = ({ children, emailToRespond }: { children: JSX.Element, emailToRespond: Email | null }) => {
    const [respondingTo] = useState<Email | null>(emailToRespond);
    const [to, setTo] = useState('');
    const [topic, setTopic] = useState('');
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState<Array<Attachment>>([]);
    const { email } = useAuth();

    const [chat, setChat] = useState<GroqAiMessage[]>([
        {
            role: GroqAiRole.SYSTEM,
            content: `You are an email chatbot assistant that responds in JSON.
            You give 3 options for the body.
            The JSON object must use the schema: 
            {
            "to":"receiver email",
            "subject":"email subject",
            "body1":"email body option1",
            "body2":"email body option2",
            "body3":"email body option3"
            }`
        }
    ]);
    const [receivedChat, setReceivedChat] = useState<{
        to: string,
        subject: string,
        messages: GroqAiMessage[]
    }>({
        to: "",
        subject: "",
        messages: []
    });

    const clearReceivedChat = useCallback(() => {
        setReceivedChat(prev => { return { ...prev, messages: [] } });
    }, []);
    const chooseReceivedChat = useCallback((index: number) => {
        if (index < 0 || index >= receivedChat.messages.length) throw new Error("Invalid Message");

        const choosenChat = receivedChat.messages[index];
        setChat(prev => [...prev, choosenChat]);
        clearReceivedChat();

        setTo(prev => {
            return (!prev) ? receivedChat.to : prev
        });
        setTopic(prev => {
            return (!prev) ? receivedChat.subject : prev
        });
        setMessage(choosenChat.content);
    }, [receivedChat]);

    const sendEmail = useCallback(async (emailToSend: EmailPost) => {
        const response = await fetch(`${API_URL}/email`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(emailToSend),
        });
        if (response.ok) {
            console.log("Email Sended");
        } else {
            throw new Error("Error sending Email");
        }
    }, []);

    const sendPrompt = useCallback(async (prompt: string) => {
        const message: GroqAiMessage = {
            content: prompt, role: GroqAiRole.USER
        }
        const response = await fetch(`${API_URL}/chat`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3-70b-8192",
                messages: [...chat,
                {
                    role: GroqAiRole.SYSTEM,
                    content: `Use the folowing context to write the email
                    {
                        "currentEmail":{
                            "from":${email}
                            "to":${to}
                            "subject":${topic}
                            "body":${message}
                        }
                        ${!respondingTo ? ""
                            : `"respondingTo":{
                            "to":${respondingTo?.From}
                            "subject":${respondingTo?.Subject}
                            "body":${respondingTo?.Body}
                        }`}
                            
                        
                    }`
                },
                    message]
            }),
        });
        if (response.ok) {
            const data = await response.json();

            if (!data.choices || data.choices.length === 0) throw new Error("No Response received");

            for (const msg of data.choices) {
                const resContent: string = msg.message.content;

                const resData = JSON.parse(resContent);

                setReceivedChat({
                    to: resData.to ?? "",
                    subject: resData.subject ?? "",
                    messages: [
                        {
                            role: GroqAiRole.ASSISTANT,
                            content: resData.body1 ?? "No Data..."
                        },
                        {
                            role: GroqAiRole.ASSISTANT,
                            content: resData.body2 ?? "No Data..."
                        },
                        {
                            role: GroqAiRole.ASSISTANT,
                            content: resData.body3 ?? "No Data..."
                        }
                    ]
                });
            }

            setChat(prev => [...prev, message])
        } else {
            throw new Error("Error sending Email");
        }
    }, [emailToRespond, chat]);
    return (<EmailSenderContext.Provider value={{
        respondingTo,
        to,
        setTo,
        topic,
        setTopic,
        message,
        setMessage,
        attachments,
        setAttachments,
        sendEmail,

        sendPrompt,
        chat,

        receivedChat,
        clearReceivedChat,
        chooseReceivedChat
    }}>
        {children}
    </EmailSenderContext.Provider>
    );
}

