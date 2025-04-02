import { JSX, useCallback, useEffect, useState } from "react";
import { EmailManagerContext, Mailbox } from "./Contexts";

const API_URL = import.meta.env.VITE_API_URL;

export const EmailManagerProvider = ({ children }: { children: JSX.Element }) => {
    const [isLoadingMailBoxes, setIsLoadingMailboxes] = useState(true)
    const [isLoadingMails, setIsLoadingMails] = useState(true)
    const [isMenuExpanded, setIsMenuExpanded] = useState(false);
    const [selectedBox, setSelectedBox] = useState<number>(-1);
    const [mailboxes, setMailBoxes] = useState<Mailbox[]>([]);
    const [selectedPage, setSelectedPage] = useState<number>(1);
    useEffect(() => {
        //  fetchEmails();
        loadEmailBoxes()
    }, []);

    const toogleMenu = useCallback(() => {
        setIsMenuExpanded(prev => !prev)
    }, [])
    const selectEmailBox = useCallback((boxIndex: number) => {
        if (!mailboxes || boxIndex >= mailboxes.length) return;

        setSelectedBox(boxIndex)
    }, [mailboxes])
    const getSelectedEmailBox = useCallback((): Mailbox | null => {
        if (selectedBox < 0 || !mailboxes || selectedBox >= mailboxes.length) return null;

        return mailboxes[selectedBox]
    }, [mailboxes, selectedBox]);

    const loadEmailBoxes = useCallback(async (): Promise<void> => {
        setIsLoadingMailboxes(true);
        const response = await fetch(`${API_URL}/email`, {
            method: "GET",
            credentials: "include"
        });
        if (response.ok) {
            const json = await response.json();

            setMailBoxes(json)
            setIsLoadingMailboxes(false);
        } else {
            setIsLoadingMailboxes(false);
            throw new Error("Fetching Mailboxes failed");
        }

    }, []);

    const loadBoxEmails = useCallback(async (box: Mailbox, page: number, size: number): Promise<void> => {
        console.log("Aqui...")
        setIsLoadingMails(true);
        const response = await fetch(`${API_URL}/email?mailbox=${box.Name}&page=${page}&size=${size}`, {
            method: "GET",
            credentials: "include"
        });
        if (response.ok) {
            try {
                const data: Mailbox = await response.json();

                const reversedEmails = [...data.Emails].reverse();
console.dir(reversedEmails);
                setMailBoxes(prev => prev.map(box => {
                    return box.Name === data.Name
                        ? { ...data, Emails: reversedEmails }
                        : box;
                }));

                setSelectedPage(page)
                setIsLoadingMails(false);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                setIsLoadingMails(false);
                throw new Error("Fetching Emails failed");
            }


        } else {
            setIsLoadingMails(false);
            throw new Error("Fetching Emails failed");
        }

    }, []);


    return (<EmailManagerContext.Provider value={{ Mailboxes: mailboxes, selectedBox, selectEmailBox, getSelectedEmailBox, isMenuExpanded, toogleMenu, loadBoxEmails, loadEmailBoxes, isLoadingMailBoxes, isLoadingMails, selectedPage }}>
        {children}
    </EmailManagerContext.Provider>
    );
}
