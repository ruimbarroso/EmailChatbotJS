import { createContext, useContext } from "react";
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
    Date: string,
    From: Address[],
    To: Address[],
    Subject: string,
    MessageId: string,
    References: string,
    ReplyTo: string,
    Body: string,
    HTMLBody: string,
    Attachments: []
}
export interface Mailbox {
    Name: string,
    NumMessages: number,
    NumUnseen: number,
    Emails: Email[]
}
export interface Manager {
    Mailboxes: Mailbox[]
    selectedBox: number
    selectEmailBox: (index: number) => void
    getSelectedEmailBox: () => Mailbox | null
    isMenuExpanded: boolean
    toogleMenu: ()=>void
    loadEmailBoxes: ()=>Promise<void>
    loadBoxEmails: (box: Mailbox, page: number, size: number)=>Promise<void>
    isLoadingMailBoxes: boolean
    isLoadingMails: boolean
    selectedPage: number
}

export const EmailManagerContext = createContext<Manager | null>(null);
export const useEmailManager = () => {
    const ctx = useContext(EmailManagerContext);
    if (!ctx) {
        throw new Error("useEmailManager must be used within an EmailManagerProvider");
    }

    return ctx;
}