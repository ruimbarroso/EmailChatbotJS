import { createContext, JSX, useContext } from "react";
export interface Account {
    email: string
    isLoadingUser: boolean
    login: (newEmail: string, password: string, service: string) => Promise<void>
    logout: () => Promise<void>
    isLoggedIn: () => boolean
    getCredentials: () => Promise<void>
}

export const AuthContext = createContext<Account | null>(null);
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return ctx;
}




export interface Address {
    Name: string,
    Address: string
}
export interface Email {
    Date: string;
    From: Address[];
    To: Address[];
    Subject: string;
    MessageId: string;
    References: string;
    ReplyTo: string;
    Body: string;
    HTMLBody: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Attachments: any[];
}
export interface Mailbox {
    Name: string,
    NumMessages: number,
    NumUnseen: number,
    Emails: Email[]
}

export interface PaginatedMailbox {
    Name: string,
    NumMessages: number,
    NumUnseen: number,
    Pages: Record<number, Email[]>
}


export interface Manager {
    Mailboxes: PaginatedMailbox[]
    selectedBox: number
    selectEmailBox: (index: number) => void
    getSelectedEmailBox: () => PaginatedMailbox | null
    loadEmailBoxes: () => Promise<void>
    loadBoxEmails: (box: PaginatedMailbox, page: number, size: number) => Promise<void>
    selectedPage: number
    selectedEmails: Email[] | null
    selectEmail: (email: Email) => void
    unselectEmail: (email: Email) => void
    isAnySelectedEmail: () => boolean
    isOnlyOneSelectedEmail: () => boolean
}

export const EmailManagerContext = createContext<Manager | null>(null);
export const useEmailManager = () => {
    const ctx = useContext(EmailManagerContext);
    if (!ctx) {
        throw new Error("useEmailManager must be used within an EmailManagerProvider");
    }

    return ctx;
}


export interface AppManager {
    isMenuExpanded: boolean
    toogleMenu: () => void

    elemStack: JSX.Element[]
    pushElem: (elem: JSX.Element) => void
    peekElem: () => JSX.Element | null
    popElem: () => void
    replaceAllElem: (elem: JSX.Element) => void
}
export const AppManagerContext = createContext<AppManager | null>(null);
export const useAppManager = () => {
    const ctx = useContext(AppManagerContext);
    if (!ctx) {
        throw new Error("useAppManager must be used within an AppManagerProvider");
    }

    return ctx;
}
export interface Attachment {
    name: string;
    type: string;
    base64Content: string;
}
export interface EmailSenderState {
    respondingTo: Email | null;
    sendEmail: (email: EmailPost) => Promise<void>;
    to: string;
    setTo: React.Dispatch<React.SetStateAction<string>>;
    topic: string;
    setTopic: React.Dispatch<React.SetStateAction<string>>;
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
    attachments: Attachment[];
    setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
    chat: GroqAiMessage[];
    sendPrompt: (prompt: string) => Promise<void>;
    receivedChat: {
        to: string,
        subject: string,
        messages: GroqAiMessage[]
    };
    clearReceivedChat: () => void;
    chooseReceivedChat: (index: number) => void;
};
export interface EmailPost {
    From: string
    To: string[]
    Message: string

}
export enum GroqAiRole {
    ASSISTANT = "assistant", USER = "user", SYSTEM = "system"
}
export interface GroqAiMessage {
    role: GroqAiRole,
    content: string
}
export const EmailSenderContext = createContext<EmailSenderState | null>(null);
export const useEmailSender = () => {
    const ctx = useContext(EmailSenderContext);
    if (!ctx) {
        throw new Error("useEmailSender must be used within an EmailSenderProvider");
    }

    return ctx;
}