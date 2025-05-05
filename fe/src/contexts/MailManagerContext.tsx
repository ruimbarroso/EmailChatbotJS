import { JSX, useCallback, useEffect, useRef, useState } from "react";
import { Email, EmailManagerContext, Mailbox, PaginatedMailbox } from "./Contexts";

const API_URL = import.meta.env.VITE_API_URL;

export const EmailManagerProvider = ({ children }: { children: JSX.Element }) => {
    const [mailboxes, setMailBoxes] = useState<PaginatedMailbox[]>([]);
    
    const [selectedEmails, setSelectedEmails] = useState<Email[]>([]);

    const [selectedBox, setSelectedBox] = useState<number>(-1);
    const [selectedPage, setSelectedPage] = useState<number>(1);

    const loadingPagesByMailbox = useRef<Map<string, Set<number>>>(new Map());
    useEffect(() => {
        const aux = loadingPagesByMailbox.current
        return () => {
            aux.clear();
        };
    }, []);

    const selectEmailBox = useCallback((boxIndex: number) => {
        if (!mailboxes || boxIndex >= mailboxes.length) return;

        setSelectedBox(boxIndex)
    }, [mailboxes])
    const getSelectedEmailBox = useCallback((): PaginatedMailbox | null => {
        if (selectedBox < 0 || !mailboxes || selectedBox >= mailboxes.length) return null;

        return mailboxes[selectedBox]
    }, [mailboxes, selectedBox]);

    const loadEmailBoxes = useCallback(async (): Promise<void> => {
        const response = await fetch(`${API_URL}/email`, {
            method: "GET",
            credentials: "include"
        });
        if (response.ok) {
            const data: Mailbox[] = await response.json();

            const paginatedMailboxes: PaginatedMailbox[] = data.map(mailbox => ({
                Name: mailbox.Name,
                NumMessages: mailbox.NumMessages,
                NumUnseen: mailbox.NumUnseen,
                Pages: {}
            }));

            setMailBoxes(paginatedMailboxes);
        } else {
            throw new Error("Fetching Mailboxes failed");
        }

    }, []);

    const loadBoxEmails = useCallback(async (box: PaginatedMailbox, page: number, size: number): Promise<void> => {
        let currentlyLoadingPages = loadingPagesByMailbox.current.get(box.Name);
        if (!currentlyLoadingPages) {
            currentlyLoadingPages = new Set();
            loadingPagesByMailbox.current.set(box.Name, currentlyLoadingPages);
        }
        if (currentlyLoadingPages.has(page)) return;
        console.log(`Loading page ${page}`);
        currentlyLoadingPages.add(page);
        setSelectedPage(page);
        const response = await fetch(`${API_URL}/email?mailbox=${box.Name}&page=${page}&size=${size}`, {
            method: "GET",
            credentials: "include"
        });
        if (response.ok) {
            try {
                const data: Mailbox = await response.json();

                const reversedEmails = [...data.Emails].reverse();

                setMailBoxes(prev => prev.map(mailbox => {
                    return mailbox.Name === data.Name
                        ? {
                            ...mailbox,
                            NumMessages: data.NumMessages,
                            NumUnseen: data.NumUnseen,
                            Pages: {
                                ...mailbox.Pages,
                                [page]: reversedEmails
                            }
                        }
                        : mailbox;
                }));


                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                setSelectedBox(-1);
                currentlyLoadingPages.delete(page);
                throw new Error("Fetching Emails failed");
            }


        } else {
            currentlyLoadingPages.delete(page);
            throw new Error("Fetching Emails failed");
        }
        currentlyLoadingPages.delete(page);
        console.log(`Finish loading page ${page}`);
    }, []);


    const selectEmail = useCallback((email: Email) => {
        setSelectedEmails(selected =>
            selected?.some(e => e.MessageId === email.MessageId)
                ? selected
                : [...(selected || []), email]
        );
    }, []);

    const unselectEmail = useCallback((email: Email) => {
        setSelectedEmails(selected =>
            selected?.filter(e => e.MessageId !== email.MessageId) ?? []
        );
    }, []);
    const isAnySelectedEmail = useCallback((): boolean => {
        return !(!selectedEmails || selectedEmails.length === 0)
    }, [selectedEmails]);
    const isOnlyOneSelectedEmail = useCallback((): boolean => {
        return !(!selectedEmails || selectedEmails.length !== 1)
    }, [selectedEmails]);
    return (<EmailManagerContext.Provider value={{
        Mailboxes: mailboxes,
        selectedBox,
        selectEmailBox,
        getSelectedEmailBox,
        loadBoxEmails,
        loadEmailBoxes,
        selectedPage,

        selectedEmails,
        selectEmail,
        unselectEmail,
        isAnySelectedEmail,
        isOnlyOneSelectedEmail
    }}>
        {children}
    </EmailManagerContext.Provider>
    );
}
